const router = require('express').Router();
const { getAll, getById, create, update, remove, uploadDocumentoAlumno, deleteDocumentoAlumno } = require('../controllers/alumnos.controller');
const { uploadParticipanteFile } = require('../middleware/upload.middleware');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/documentos', uploadParticipanteFile.single('archivo'), uploadDocumentoAlumno);
router.delete('/:id/documentos/:tipoDocumento', deleteDocumentoAlumno);

module.exports = router;
