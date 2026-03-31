const { Instructor, Alumno } = require('../models');

const getAll = async (req, res) => {
  try {
    const instructores = await Instructor.findAll({
      order: [['nombre', 'ASC']],
    });
    res.json(instructores);
  } catch (error) {
    console.error('Error al obtener instructores:', error);
    res.status(500).json({ error: 'Error al obtener instructores' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, rut } = req.body;
    if (!nombre || !rut) {
      return res.status(400).json({ error: 'Nombre y RUT son obligatorios' });
    }

    const existing = await Instructor.findOne({ where: { rut } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un instructor con ese RUT' });
    }

    const instructor = await Instructor.create({ nombre, rut });
    res.status(201).json(instructor);
  } catch (error) {
    console.error('Error al crear instructor:', error);
    res.status(500).json({ error: 'Error al crear instructor' });
  }
};

const update = async (req, res) => {
  try {
    const instructor = await Instructor.findByPk(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' });
    }

    if (req.body.rut && req.body.rut !== instructor.rut) {
      const existing = await Instructor.findOne({ where: { rut: req.body.rut } });
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un instructor con ese RUT' });
      }
    }

    await instructor.update(req.body);
    res.json(instructor);
  } catch (error) {
    console.error('Error al actualizar instructor:', error);
    res.status(500).json({ error: 'Error al actualizar instructor' });
  }
};

const remove = async (req, res) => {
  try {
    const instructor = await Instructor.findByPk(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' });
    }

    // Check if has assigned students
    const alumnosCount = await Alumno.count({ where: { instructor_id: instructor.id } });
    if (alumnosCount > 0) {
      return res.status(400).json({
        error: `No se puede eliminar. El instructor tiene ${alumnosCount} alumno(s) asignado(s).`,
      });
    }

    await instructor.destroy();
    res.json({ message: 'Instructor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar instructor:', error);
    res.status(500).json({ error: 'Error al eliminar instructor' });
  }
};

module.exports = { getAll, create, update, remove };
