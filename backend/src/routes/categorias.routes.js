const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/categorias.controller');

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
