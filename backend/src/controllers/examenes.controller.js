const { Examen } = require('../models');

const getByAlumno = async (req, res) => {
  try {
    let examen = await Examen.findOne({ where: { alumno_id: req.params.alumnoId } });

    if (!examen) {
      examen = await Examen.create({ alumno_id: req.params.alumnoId });
    }

    res.json(examen);
  } catch (error) {
    console.error('Error al obtener exámenes:', error);
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
};

const update = async (req, res) => {
  try {
    let examen = await Examen.findOne({ where: { alumno_id: req.params.alumnoId } });

    if (!examen) {
      examen = await Examen.create({ alumno_id: req.params.alumnoId, ...req.body });
    } else {
      await examen.update(req.body);
    }

    res.json(examen);
  } catch (error) {
    console.error('Error al actualizar exámenes:', error);
    res.status(500).json({ error: 'Error al actualizar exámenes' });
  }
};

module.exports = { getByAlumno, update };
