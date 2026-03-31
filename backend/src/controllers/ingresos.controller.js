const { Ingreso } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { tipo, fecha_desde, fecha_hasta } = req.query;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (fecha_desde && fecha_hasta) {
      where.fecha = { [Op.between]: [fecha_desde, fecha_hasta] };
    } else if (fecha_desde) {
      where.fecha = { [Op.gte]: fecha_desde };
    } else if (fecha_hasta) {
      where.fecha = { [Op.lte]: fecha_hasta };
    }

    const ingresos = await Ingreso.findAll({
      where,
      order: [['fecha', 'DESC']],
    });

    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

const create = async (req, res) => {
  try {
    const { monto, fecha, descripcion } = req.body;

    if (!monto || !fecha) {
      return res.status(400).json({ error: 'Monto y fecha son obligatorios' });
    }

    const ingreso = await Ingreso.create({
      monto,
      fecha,
      descripcion,
      tipo: 'manual',
    });

    res.status(201).json(ingreso);
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    res.status(500).json({ error: 'Error al crear ingreso' });
  }
};

const remove = async (req, res) => {
  try {
    const ingreso = await Ingreso.findByPk(req.params.id);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    if (ingreso.tipo === 'automatico') {
      return res.status(400).json({ error: 'No se puede eliminar un ingreso automático. Elimine el pago asociado.' });
    }

    await ingreso.destroy();
    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
};

module.exports = { getAll, create, remove };
