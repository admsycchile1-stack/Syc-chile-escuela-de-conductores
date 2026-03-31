const router = require('express').Router();
const {
  getResumen,
  getAlumnosPorMes,
  getExamenesResumen,
  getFinanzas,
} = require('../controllers/estadisticas.controller');

router.get('/resumen', getResumen);
router.get('/alumnos-por-mes', getAlumnosPorMes);
router.get('/examenes', getExamenesResumen);
router.get('/finanzas', getFinanzas);

module.exports = router;
