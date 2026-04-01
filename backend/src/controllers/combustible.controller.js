const { Combustible } = require('../models');
const { Op } = require('sequelize');

const normalizePatente = (value) => String(value || '').trim().toUpperCase();

const buildWhere = ({ patente, fecha_desde, fecha_hasta }) => {
  const where = {};

  if (patente) {
    where.patente = { [Op.like]: `%${normalizePatente(patente)}%` };
  }

  if (fecha_desde && fecha_hasta) {
    where.fecha = { [Op.between]: [fecha_desde, fecha_hasta] };
  } else if (fecha_desde) {
    where.fecha = { [Op.gte]: fecha_desde };
  } else if (fecha_hasta) {
    where.fecha = { [Op.lte]: fecha_hasta };
  }

  return where;
};

const mapRegistro = (registro) => {
  const data = registro.toJSON ? registro.toJSON() : registro;
  const litros = parseFloat(data.litros || 0);
  const precioCargado = parseFloat(data.precio_cargado || 0);
  const kilometrosRecorridos = parseInt(data.kilometros_recorridos || 0, 10);

  return {
    ...data,
    litros,
    precio_cargado: precioCargado,
    kilometros_recorridos: kilometrosRecorridos,
    rendimiento_km_litro: litros > 0 ? kilometrosRecorridos / litros : 0,
    costo_por_km: kilometrosRecorridos > 0 ? precioCargado / kilometrosRecorridos : 0,
  };
};

const getAll = async (req, res) => {
  try {
    const registros = await Combustible.findAll({
      where: buildWhere(req.query),
      order: [['fecha', 'DESC'], ['created_at', 'DESC']],
    });

    res.json(registros.map(mapRegistro));
  } catch (error) {
    console.error('Error al obtener registros de combustible:', error);
    res.status(500).json({ error: 'Error al obtener registros de combustible' });
  }
};

const create = async (req, res) => {
  try {
    const { fecha, patente, litros, precio_cargado, kilometros_recorridos } = req.body;

    if (!fecha || !patente || !litros || !precio_cargado || kilometros_recorridos === undefined || kilometros_recorridos === null || kilometros_recorridos === '') {
      return res.status(400).json({
        error: 'Fecha, patente, litros, precio cargado y kilómetros recorridos son obligatorios',
      });
    }

    const registro = await Combustible.create({
      fecha,
      patente: normalizePatente(patente),
      litros,
      precio_cargado,
      kilometros_recorridos,
    });

    res.status(201).json(mapRegistro(registro));
  } catch (error) {
    console.error('Error al crear registro de combustible:', error);
    res.status(500).json({ error: 'Error al crear registro de combustible' });
  }
};

const update = async (req, res) => {
  try {
    const registro = await Combustible.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro de combustible no encontrado' });
    }

    const { fecha, patente, litros, precio_cargado, kilometros_recorridos } = req.body;

    if (!fecha || !patente || !litros || !precio_cargado || kilometros_recorridos === undefined || kilometros_recorridos === null || kilometros_recorridos === '') {
      return res.status(400).json({
        error: 'Fecha, patente, litros, precio cargado y kilómetros recorridos son obligatorios',
      });
    }

    await registro.update({
      fecha,
      patente: normalizePatente(patente),
      litros,
      precio_cargado,
      kilometros_recorridos,
    });

    res.json(mapRegistro(registro));
  } catch (error) {
    console.error('Error al actualizar registro de combustible:', error);
    res.status(500).json({ error: 'Error al actualizar registro de combustible' });
  }
};

const remove = async (req, res) => {
  try {
    const registro = await Combustible.findByPk(req.params.id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro de combustible no encontrado' });
    }

    await registro.destroy();
    res.json({ message: 'Registro de combustible eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar registro de combustible:', error);
    res.status(500).json({ error: 'Error al eliminar registro de combustible' });
  }
};

module.exports = { getAll, create, update, remove };
