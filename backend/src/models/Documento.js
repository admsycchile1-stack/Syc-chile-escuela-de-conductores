const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  archivo_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'documentos',
});

module.exports = Documento;
