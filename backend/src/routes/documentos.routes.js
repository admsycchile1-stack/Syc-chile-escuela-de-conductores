const router = require('express').Router();
const { getAll, create, download, remove } = require('../controllers/documentos.controller');
const { uploadDocumento } = require('../middleware/upload.middleware');

router.get('/', getAll);
router.post('/', uploadDocumento.single('archivo'), create);
router.get('/:id/download', download);
router.delete('/:id', remove);

module.exports = router;
