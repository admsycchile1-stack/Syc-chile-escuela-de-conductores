const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/egresos.controller');
const { uploadEgreso } = require('../middleware/upload.middleware');

router.get('/', getAll);
router.post('/', uploadEgreso.single('archivo'), create);
router.put('/:id', uploadEgreso.single('archivo'), update);
router.delete('/:id', remove);

module.exports = router;
