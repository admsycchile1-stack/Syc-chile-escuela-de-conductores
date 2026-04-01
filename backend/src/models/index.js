const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Instructor = require('./Instructor');
const Alumno = require('./Alumno');
const Examen = require('./Examen');
const Pago = require('./Pago');
const Ingreso = require('./Ingreso');
const CategoriaEgreso = require('./CategoriaEgreso');
const Egreso = require('./Egreso');
const Documento = require('./Documento');
const Combustible = require('./Combustible');

// Relaciones
Instructor.hasMany(Alumno, { foreignKey: 'instructor_id', as: 'alumnos' });
Alumno.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'instructor' });

Alumno.hasOne(Examen, { foreignKey: 'alumno_id', as: 'examenes' });
Examen.belongsTo(Alumno, { foreignKey: 'alumno_id', as: 'alumno' });

Alumno.hasMany(Pago, { foreignKey: 'alumno_id', as: 'pagos' });
Pago.belongsTo(Alumno, { foreignKey: 'alumno_id', as: 'alumno' });

Pago.hasOne(Ingreso, { foreignKey: 'pago_id', as: 'ingreso' });
Ingreso.belongsTo(Pago, { foreignKey: 'pago_id', as: 'pago' });

CategoriaEgreso.hasMany(Egreso, { foreignKey: 'categoria_id', as: 'egresos' });
Egreso.belongsTo(CategoriaEgreso, { foreignKey: 'categoria_id', as: 'categoria' });

module.exports = {
  sequelize,
  Usuario,
  Instructor,
  Alumno,
  Examen,
  Pago,
  Ingreso,
  CategoriaEgreso,
  Egreso,
  Documento,
  Combustible,
};
