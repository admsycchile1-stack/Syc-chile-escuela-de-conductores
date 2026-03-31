const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingreso = sequelize.define('Ingreso', {
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
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('automatico', 'manual'),
    allowNull: false,
    defaultValue: 'manual',
  },
  pago_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'ingresos',
});

module.exports = Ingreso;
