const { Documento } = require('../models');
const path = require('path');
const fs = require('fs');

const getAll = async (req, res) => {
  try {
    const documentos = await Documento.findAll({
      order: [['created_at', 'DESC']],
    });
    res.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo es obligatorio' });
    }

    const { nombre, descripcion, tipo } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es obligatorio' });
    }

    const documento = await Documento.create({
      nombre,
      descripcion,
      tipo,
      archivo_url: `/uploads/documentos/${req.file.filename}`,
    });

    res.status(201).json(documento);
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error al crear documento' });
  }
};

const download = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const filePath = path.join(__dirname, '../..', documento.archivo_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    res.download(filePath, documento.nombre + path.extname(documento.archivo_url));
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: 'Error al descargar documento' });
  }
};

const remove = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../..', documento.archivo_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await documento.destroy();
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
};

module.exports = { getAll, create, download, remove };
