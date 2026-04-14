const { Alumno, Instructor, Examen, Pago, Ingreso } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const deleteStoredFile = (fileUrl) => {
  if (!fileUrl) return;

  const filePath = path.join(__dirname, '../..', fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getAll = async (req, res) => {
  try {
    const { estado, instructor_id, search } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (instructor_id) where.instructor_id = instructor_id;
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { rut: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const alumnos = await Alumno.findAll({
      where,
      include: [
        { model: Instructor, as: 'instructor', attributes: ['id', 'nombre'] },
        { model: Pago, as: 'pagos', attributes: ['id', 'comprobante_url'], required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(alumnos.map((alumno) => {
      const alumnoJson = alumno.toJSON();
      const pagos = alumnoJson.pagos || [];
      const pagosPendientesComprobante = pagos.filter((pago) => !pago.comprobante_url).length;

      return {
        ...alumnoJson,
        total_pagos: pagos.length,
        pagos_pendientes_comprobante: pagosPendientesComprobante,
        tiene_comprobante_pendiente: pagosPendientesComprobante > 0,
      };
    }));
  } catch (error) {
    console.error('Error al obtener alumnos:', error);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
};

const getById = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id, {
      include: [
        { model: Instructor, as: 'instructor', attributes: ['id', 'nombre'] },
        { model: Examen, as: 'examenes' },
        {
          model: Pago,
          as: 'pagos',
          order: [['fecha', 'DESC']],
        },
      ],
    });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Calculate total paid
    const totalPagado = alumno.pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);

    res.json({
      ...alumno.toJSON(),
      total_pagado: totalPagado,
      saldo_pendiente: alumno.valor_curso ? parseFloat(alumno.valor_curso) - totalPagado : null,
    });
  } catch (error) {
    console.error('Error al obtener alumno:', error);
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, rut } = req.body;

    if (!nombre || !rut) {
      return res.status(400).json({ error: 'Nombre y RUT son obligatorios' });
    }

    const existing = await Alumno.findOne({ where: { rut } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un alumno con ese RUT' });
    }

    const data = { ...req.body };
    for (const key in data) {
      if (data[key] === '') {
        data[key] = null;
      }
    }

    const alumno = await Alumno.create(data);

    // Create exam record for this student
    await Examen.create({ alumno_id: alumno.id });

    const result = await Alumno.findByPk(alumno.id, {
      include: [{ model: Instructor, as: 'instructor', attributes: ['id', 'nombre'] }],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear alumno:', error);
    res.status(500).json({ error: 'Error al crear alumno' });
  }
};

const update = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Check RUT uniqueness if changing
    if (req.body.rut && req.body.rut !== alumno.rut) {
      const existing = await Alumno.findOne({ where: { rut: req.body.rut } });
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un alumno con ese RUT' });
      }
    }

    const data = { ...req.body };
    for (const key in data) {
      if (data[key] === '') {
        data[key] = null;
      }
    }

    await alumno.update(data);

    const result = await Alumno.findByPk(alumno.id, {
      include: [{ model: Instructor, as: 'instructor', attributes: ['id', 'nombre'] }],
    });

    res.json(result);
  } catch (error) {
    console.error('Error al actualizar alumno:', error);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
};

const remove = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Delete related records
    await Examen.destroy({ where: { alumno_id: alumno.id } });
    
    const pagos = await Pago.findAll({ where: { alumno_id: alumno.id } });
    for (const pago of pagos) {
      await Ingreso.destroy({ where: { pago_id: pago.id } });
    }
    await Pago.destroy({ where: { alumno_id: alumno.id } });

    await alumno.destroy();
    res.json({ message: 'Alumno eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar alumno:', error);
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
};

const uploadDocumentoAlumno = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    const { tipoDocumento } = req.body; // 'cedula' o 'contrato'

    if (!['cedula', 'contrato'].includes(tipoDocumento)) {
      return res.status(400).json({ error: 'Tipo de documento no válido' });
    }

    const folderName = `${alumno.nombre} - ${alumno.rut}`.replace(/[\\/:*?"<>|]/g, '');
    const participantDir = path.join(__dirname, '../../escuela_de_conductores/participantes', folderName);
    
    if (!fs.existsSync(participantDir)) {
      fs.mkdirSync(participantDir, { recursive: true });
    }
    
    const newPath = path.join(participantDir, req.file.filename);
    fs.renameSync(req.file.path, newPath);
    
    const fileUrl = `/escuela_de_conductores/participantes/${encodeURIComponent(folderName)}/${req.file.filename}`;
    
    if (tipoDocumento === 'cedula') {
      deleteStoredFile(alumno.cedula_url);
      await alumno.update({ cedula_url: fileUrl });
    } else {
      deleteStoredFile(alumno.contrato_url);
      await alumno.update({ contrato_url: fileUrl });
    }

    res.json({ message: 'Documento subido correctamente', url: fileUrl });
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error al subir documento' });
  }
};

const deleteDocumentoAlumno = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const { tipoDocumento } = req.params;
    if (!['cedula', 'contrato'].includes(tipoDocumento)) {
      return res.status(400).json({ error: 'Tipo de documento no válido' });
    }

    const field = tipoDocumento === 'cedula' ? 'cedula_url' : 'contrato_url';
    if (!alumno[field]) {
      return res.status(404).json({ error: 'El documento no existe' });
    }

    deleteStoredFile(alumno[field]);
    await alumno.update({ [field]: null });

    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
};

module.exports = { getAll, getById, create, update, remove, uploadDocumentoAlumno, deleteDocumentoAlumno };
