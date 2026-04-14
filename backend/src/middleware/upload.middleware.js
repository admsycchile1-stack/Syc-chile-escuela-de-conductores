const multer = require('multer');
const path = require('path');
const fs = require('fs');

const STORAGE_ROOTS = {
  escuela: path.join(__dirname, '../../escuela_de_conductores'),
  uploads: path.join(__dirname, '../../uploads'),
};

const createStorage = (rootKey, folder) => {
  const uploadPath = path.join(STORAGE_ROOTS[rootKey], folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream', // A veces enviado por defecto
    'text/csv',
    'application/vnd.ms-outlook', // Archivos .msg de Outlook
    'message/rfc822' // Archivos de correo estándar (.eml)
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`Archivo rechazado - Nombre: ${file.originalname}, Mimetype: ${file.mimetype}`);
    cb(new Error(`Tipo de archivo no permitido: ${file.originalname} (${file.mimetype})`), false);
  }
};

const uploadComprobante = multer({
  storage: createStorage('escuela', 'tmp'), // Se moverá en el controlador
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadEgreso = multer({
  storage: createStorage('uploads', 'egresos'),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadDocumento = multer({
  storage: createStorage('uploads', 'documentos'),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadParticipanteFile = multer({
  storage: createStorage('escuela', 'tmp'), // Temporal, movido por el controlador
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = {
  uploadComprobante,
  uploadEgreso,
  uploadDocumento,
  uploadParticipanteFile,
};
