const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instructor = sequelize.define('Instructor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'instructores',
});

module.exports = Instructor;
