const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  metodo_pago: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  comprobante_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'pagos',
});

module.exports = Pago;
