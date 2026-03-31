const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Examen = sequelize.define('Examen', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  psicotecnico_1: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  psicotecnico_1_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  psicotecnico_2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  psicotecnico_2_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  psicotecnico_3: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  psicotecnico_3_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  examen_teorico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  examen_teorico_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  examen_practico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  examen_practico_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'examenes',
});

module.exports = Examen;
