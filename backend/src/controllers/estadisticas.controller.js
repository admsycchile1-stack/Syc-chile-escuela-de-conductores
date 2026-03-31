const { Alumno, Examen, Ingreso, Egreso, CategoriaEgreso } = require('../models');
const { Op, fn, col } = require('sequelize');

const MESES_LARGOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const getTargetYear = (year) => {
  const parsedYear = Number(year);
  return Number.isInteger(parsedYear) ? parsedYear : new Date().getFullYear();
};

const getOptionalYear = (year) => {
  if (year === undefined || year === null || year === '') {
    return null;
  }

  const parsedYear = Number(year);
  return Number.isInteger(parsedYear) ? parsedYear : null;
};

const getAlumnoMatriculaDate = (alumno) => {
  const fechaInicioValue = alumno.fecha_inicio || alumno.get?.('fecha_inicio');
  const createdAtValue =
    alumno.created_at ||
    alumno.createdAt ||
    alumno.get?.('created_at') ||
    alumno.get?.('createdAt');

  const fechaInicio = fechaInicioValue ? new Date(`${fechaInicioValue}T00:00:00`) : null;
  const createdAt = createdAtValue ? new Date(createdAtValue) : null;

  if (fechaInicio && !Number.isNaN(fechaInicio.getTime())) {
    return fechaInicio;
  }

  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    return createdAt;
  }

  return null;
};

const getFilteredAlumnos = async ({ year, instructor_id, includeExamen = false }) => {
  const targetYear = getOptionalYear(year);
  const where = {};

  if (instructor_id) {
    where.instructor_id = instructor_id;
  }

  const alumnos = await Alumno.findAll({
    where,
    include: includeExamen ? [{ model: Examen, as: 'examenes', required: false }] : [],
    order: [['nombre', 'ASC']],
  });

  const alumnosFiltrados = alumnos.filter((alumno) => {
    const matriculaDate = getAlumnoMatriculaDate(alumno);
    if (!matriculaDate) {
      return false;
    }

    if (!targetYear) {
      return true;
    }

    return matriculaDate.getFullYear() === targetYear;
  });

  return { targetYear, alumnos: alumnosFiltrados };
};

const getResumen = async (req, res) => {
  try {
    const totalAlumnos = await Alumno.count();
    const alumnosEnCurso = await Alumno.count({ where: { estado: 'en_curso' } });
    const alumnosFinalizados = await Alumno.count({ where: { estado: 'finalizado' } });
    const alumnosAbandonados = await Alumno.count({ where: { estado: 'abandonado' } });

    const totalIngresos = await Ingreso.sum('monto') || 0;
    const totalEgresos = await Egreso.sum('monto') || 0;

    // Current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const ingresosMes = await Ingreso.sum('monto', {
      where: { fecha: { [Op.between]: [firstDayOfMonth, lastDayOfMonth] } },
    }) || 0;

    const egresosMes = await Egreso.sum('monto', {
      where: { fecha: { [Op.between]: [firstDayOfMonth, lastDayOfMonth] } },
    }) || 0;

    res.json({
      totalAlumnos,
      alumnosEnCurso,
      alumnosFinalizados,
      alumnosAbandonados,
      totalIngresos: parseFloat(totalIngresos),
      totalEgresos: parseFloat(totalEgresos),
      balance: parseFloat(totalIngresos) - parseFloat(totalEgresos),
      ingresosMes: parseFloat(ingresosMes),
      egresosMes: parseFloat(egresosMes),
      balanceMes: parseFloat(ingresosMes) - parseFloat(egresosMes),
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

const getAlumnosPorMes = async (req, res) => {
  try {
    const { targetYear, alumnos } = await getFilteredAlumnos(req.query);
    const conteoMensual = new Array(12).fill(0);

    alumnos.forEach((alumno) => {
      const matriculaDate = getAlumnoMatriculaDate(alumno);
      if (matriculaDate) {
        conteoMensual[matriculaDate.getMonth()] += 1;
      }
    });

    const result = MESES_LARGOS.map((nombre, index) => ({
      mes: index + 1,
      nombre,
      total: conteoMensual[index],
      year: targetYear,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener alumnos por mes:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

const getExamenesResumen = async (req, res) => {
  try {
    const { targetYear, alumnos } = await getFilteredAlumnos({
      ...req.query,
      includeExamen: true,
    });

    const aprobadosTeorico = [];
    const aprobadosPractico = [];
    const pendientes = [];
    const estados = {
      en_curso: [],
      finalizado: [],
      abandonado: [],
    };

    alumnos.forEach((alumno) => {
      const examen = alumno.examenes;
      const teoricoAprobado = Boolean(examen?.examen_teorico);
      const practicoAprobado = Boolean(examen?.examen_practico);
      const matriculaDate = getAlumnoMatriculaDate(alumno);

      const alumnoBase = {
        id: alumno.id,
        nombre: alumno.nombre,
        rut: alumno.rut,
        estado: alumno.estado,
        fecha_inicio: alumno.fecha_inicio,
        matricula_fecha: matriculaDate ? matriculaDate.toISOString().split('T')[0] : null,
      };

      if (estados[alumno.estado]) {
        estados[alumno.estado].push(alumnoBase);
      }

      if (teoricoAprobado) {
        aprobadosTeorico.push({
          ...alumnoBase,
          fecha_aprobacion: examen.examen_teorico_fecha,
        });
      }

      if (practicoAprobado) {
        aprobadosPractico.push({
          ...alumnoBase,
          fecha_aprobacion: examen.examen_practico_fecha,
        });
      }

      if (!teoricoAprobado || !practicoAprobado) {
        let pendiente = 'ambos';

        if (teoricoAprobado && !practicoAprobado) {
          pendiente = 'practico';
        } else if (!teoricoAprobado && practicoAprobado) {
          pendiente = 'teorico';
        }

        pendientes.push({
          ...alumnoBase,
          pendiente,
          examen_teorico: teoricoAprobado,
          examen_practico: practicoAprobado,
        });
      }
    });

    res.json({
      year: targetYear,
      totalMatriculados: alumnos.length,
      aprobadosTeorico: {
        total: aprobadosTeorico.length,
        alumnos: aprobadosTeorico,
      },
      aprobadosPractico: {
        total: aprobadosPractico.length,
        alumnos: aprobadosPractico,
      },
      pendientes: {
        total: pendientes.length,
        teorico: pendientes.filter((alumno) => alumno.pendiente === 'teorico').length,
        practico: pendientes.filter((alumno) => alumno.pendiente === 'practico').length,
        ambos: pendientes.filter((alumno) => alumno.pendiente === 'ambos').length,
        alumnos: pendientes,
      },
      estados: {
        enCurso: {
          total: estados.en_curso.length,
          alumnos: estados.en_curso,
        },
        finalizados: {
          total: estados.finalizado.length,
          alumnos: estados.finalizado,
        },
        abandonados: {
          total: estados.abandonado.length,
          alumnos: estados.abandonado,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener resumen de exámenes:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de exámenes' });
  }
};

const getFinanzas = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = getTargetYear(year);

    const dateFilter = {
      fecha: {
        [Op.and]: [
          { [Op.gte]: `${targetYear}-01-01` },
          { [Op.lte]: `${targetYear}-12-31` },
        ],
      },
    };

    // Monthly income
    const ingresosMensuales = await Ingreso.findAll({
      where: dateFilter,
      attributes: [
        [fn('MONTH', col('fecha')), 'mes'],
        [fn('SUM', col('monto')), 'total'],
      ],
      group: [fn('MONTH', col('fecha'))],
      raw: true,
    });

    // Monthly expenses
    const egresosMensuales = await Egreso.findAll({
      where: dateFilter,
      attributes: [
        [fn('MONTH', col('fecha')), 'mes'],
        [fn('SUM', col('monto')), 'total'],
      ],
      group: [fn('MONTH', col('fecha'))],
      raw: true,
    });

    // Expenses by category
    const egresosPorCategoria = await Egreso.findAll({
      where: dateFilter,
      attributes: [
        'categoria_id',
        [fn('SUM', col('monto')), 'total'],
      ],
      include: [{ model: CategoriaEgreso, as: 'categoria', attributes: ['nombre'] }],
      group: ['categoria_id', 'categoria.id', 'categoria.nombre'],
      raw: true,
      nest: true,
    });

    const resumenMensual = MESES_CORTOS.map((nombre, index) => {
      const ingreso = ingresosMensuales.find((i) => parseInt(i.mes) === index + 1);
      const egreso = egresosMensuales.find((e) => parseInt(e.mes) === index + 1);
      const ingresoTotal = ingreso ? parseFloat(ingreso.total) : 0;
      const egresoTotal = egreso ? parseFloat(egreso.total) : 0;

      return {
        mes: index + 1,
        nombre,
        ingresos: ingresoTotal,
        egresos: egresoTotal,
        balance: ingresoTotal - egresoTotal,
      };
    });

    res.json({
      year: targetYear,
      resumenMensual,
      egresosPorCategoria: egresosPorCategoria.map((e) => ({
        categoria: e.categoria.nombre,
        total: parseFloat(e.total),
      })),
    });
  } catch (error) {
    console.error('Error al obtener finanzas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas financieras' });
  }
};

module.exports = { getResumen, getAlumnosPorMes, getExamenesResumen, getFinanzas };
