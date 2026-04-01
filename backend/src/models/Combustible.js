const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Combustible = sequelize.define('Combustible', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  patente: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  litros: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  precio_cargado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  kilometros_recorridos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'combustible',
});

module.exports = Combustible;
