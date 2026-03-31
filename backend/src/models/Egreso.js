const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Egreso = sequelize.define('Egreso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  archivo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'egresos',
});

module.exports = Egreso;
