const { Egreso, CategoriaEgreso } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const { categoria_id, fecha_desde, fecha_hasta } = req.query;
    const where = {};

    if (categoria_id) where.categoria_id = categoria_id;
    if (fecha_desde && fecha_hasta) {
      where.fecha = { [Op.between]: [fecha_desde, fecha_hasta] };
    } else if (fecha_desde) {
      where.fecha = { [Op.gte]: fecha_desde };
    } else if (fecha_hasta) {
      where.fecha = { [Op.lte]: fecha_hasta };
    }

    const egresos = await Egreso.findAll({
      where,
      include: [{ model: CategoriaEgreso, as: 'categoria', attributes: ['id', 'nombre'] }],
      order: [['fecha', 'DESC']],
    });

    res.json(egresos);
  } catch (error) {
    console.error('Error al obtener egresos:', error);
    res.status(500).json({ error: 'Error al obtener egresos' });
  }
};

const create = async (req, res) => {
  try {
    const { monto, fecha, categoria_id, descripcion } = req.body;

    if (!monto || !fecha || !categoria_id) {
      return res.status(400).json({ error: 'Monto, fecha y categoría son obligatorios' });
    }

    const archivo_url = req.file ? `/uploads/egresos/${req.file.filename}` : null;

    const egreso = await Egreso.create({
      monto,
      fecha,
      categoria_id,
      descripcion,
      archivo_url,
    });

    const result = await Egreso.findByPk(egreso.id, {
      include: [{ model: CategoriaEgreso, as: 'categoria', attributes: ['id', 'nombre'] }],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear egreso:', error);
    res.status(500).json({ error: 'Error al crear egreso' });
  }
};

const update = async (req, res) => {
  try {
    const egreso = await Egreso.findByPk(req.params.id);
    if (!egreso) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }

    if (req.file) {
      // Delete old file if exists
      if (egreso.archivo_url) {
        const oldPath = path.join(__dirname, '../..', egreso.archivo_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.archivo_url = `/uploads/egresos/${req.file.filename}`;
    }

    await egreso.update(req.body);

    const result = await Egreso.findByPk(egreso.id, {
      include: [{ model: CategoriaEgreso, as: 'categoria', attributes: ['id', 'nombre'] }],
    });

    res.json(result);
  } catch (error) {
    console.error('Error al actualizar egreso:', error);
    res.status(500).json({ error: 'Error al actualizar egreso' });
  }
};

const remove = async (req, res) => {
  try {
    const egreso = await Egreso.findByPk(req.params.id);
    if (!egreso) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }

    // Delete associated file
    if (egreso.archivo_url) {
      const filePath = path.join(__dirname, '../..', egreso.archivo_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await egreso.destroy();
    res.json({ message: 'Egreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar egreso:', error);
    res.status(500).json({ error: 'Error al eliminar egreso' });
  }
};

module.exports = { getAll, create, update, remove };
