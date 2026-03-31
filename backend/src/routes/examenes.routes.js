const router = require('express').Router();
const { getByAlumno, update } = require('../controllers/examenes.controller');

router.get('/:alumnoId', getByAlumno);
router.put('/:alumnoId', update);

module.exports = router;
