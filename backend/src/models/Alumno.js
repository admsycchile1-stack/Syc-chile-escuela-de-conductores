const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alumno = sequelize.define('Alumno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fecha_termino: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  medio_pago: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  valor_curso: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('en_curso', 'finalizado', 'abandonado'),
    allowNull: false,
    defaultValue: 'en_curso',
  },
  cedula_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contrato_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'alumnos',
});

module.exports = Alumno;
