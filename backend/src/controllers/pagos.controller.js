const fs = require('fs');
const path = require('path');
const { Pago, Ingreso, Alumno } = require('../models');

const getByAlumno = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { alumno_id: req.params.alumnoId },
      order: [['fecha', 'DESC']],
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

const create = async (req, res) => {
  try {
    const { alumno_id, monto, fecha, metodo_pago } = req.body;

    if (!alumno_id || !monto || !fecha) {
      return res.status(400).json({ error: 'Alumno, monto y fecha son obligatorios' });
    }

    const alumno = await Alumno.findByPk(alumno_id);
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    let comprobante_url = null;
    if (req.file) {
      // Sanitize folder name
      const folderName = `${alumno.nombre} - ${alumno.rut}`.replace(/[\\/:*?"<>|]/g, '');
      const participantDir = path.join(__dirname, '../../escuela_de_conductores/participantes', folderName);
      
      if (!fs.existsSync(participantDir)) {
        fs.mkdirSync(participantDir, { recursive: true });
      }
      
      const newPath = path.join(participantDir, req.file.filename);
      fs.renameSync(req.file.path, newPath);
      comprobante_url = `/escuela_de_conductores/participantes/${encodeURIComponent(folderName)}/${req.file.filename}`;
    }

    const pago = await Pago.create({
      alumno_id,
      monto,
      fecha,
      metodo_pago,
      comprobante_url,
    });

    // Auto-create income record
    await Ingreso.create({
      monto,
      fecha,
      descripcion: `Pago de curso - ${alumno.nombre} (${alumno.rut})`,
      tipo: 'automatico',
      pago_id: pago.id,
    });

    res.status(201).json(pago);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error al crear pago' });
  }
};

const remove = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Delete associated income record
    await Ingreso.destroy({ where: { pago_id: pago.id } });
    await pago.destroy();

    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};

module.exports = { getByAlumno, create, remove };
