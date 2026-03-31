const { CategoriaEgreso, Egreso } = require('../models');

const getAll = async (req, res) => {
  try {
    const categorias = await CategoriaEgreso.findAll({
      order: [['nombre', 'ASC']],
    });
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es obligatorio' });
    }

    const existing = await CategoriaEgreso.findOne({ where: { nombre } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const categoria = await CategoriaEgreso.create({ nombre });
    res.status(201).json(categoria);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

const update = async (req, res) => {
  try {
    const categoria = await CategoriaEgreso.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.update(req.body);
    res.json(categoria);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

const remove = async (req, res) => {
  try {
    const categoria = await CategoriaEgreso.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const egresosCount = await Egreso.count({ where: { categoria_id: categoria.id } });
    if (egresosCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar. La categoría tiene ${egresosCount} egreso(s) asociado(s).`,
      });
    }

    await categoria.destroy();
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

module.exports = { getAll, create, update, remove };
