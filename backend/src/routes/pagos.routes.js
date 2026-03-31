const router = require('express').Router();
const { getByAlumno, create, remove } = require('../controllers/pagos.controller');
const { uploadComprobante } = require('../middleware/upload.middleware');

router.get('/alumno/:alumnoId', getByAlumno);
router.post('/', uploadComprobante.single('comprobante'), create);
router.delete('/:id', remove);

module.exports = router;
