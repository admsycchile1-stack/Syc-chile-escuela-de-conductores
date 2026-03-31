const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaEgreso = sequelize.define('CategoriaEgreso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'categorias_egreso',
});

module.exports = CategoriaEgreso;
