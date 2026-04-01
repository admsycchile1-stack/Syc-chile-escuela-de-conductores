require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const { sequelize, Usuario } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const instructoresRoutes = require('./routes/instructores.routes');
const examenesRoutes = require('./routes/examenes.routes');
const pagosRoutes = require('./routes/pagos.routes');
const ingresosRoutes = require('./routes/ingresos.routes');
const egresosRoutes = require('./routes/egresos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const documentosRoutes = require('./routes/documentos.routes');
const estadisticasRoutes = require('./routes/estadisticas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const combustibleRoutes = require('./routes/combustible.routes');

const authMiddleware = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

const parseCorsOrigins = () => {
  const rawOrigins = process.env.CORS_ORIGIN || '';
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins.length) {
    return null;
  }

  return origins;
};

const allowedOrigins = parseCorsOrigins();

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!allowedOrigins || !origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/escuela_de_conductores', express.static(path.join(__dirname, '../escuela_de_conductores')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', authMiddleware, alumnosRoutes);
app.use('/api/instructores', authMiddleware, instructoresRoutes);
app.use('/api/examenes', authMiddleware, examenesRoutes);
app.use('/api/pagos', authMiddleware, pagosRoutes);
app.use('/api/ingresos', authMiddleware, ingresosRoutes);
app.use('/api/egresos', authMiddleware, egresosRoutes);
app.use('/api/categorias', authMiddleware, categoriasRoutes);
app.use('/api/documentos', authMiddleware, documentosRoutes);
app.use('/api/estadisticas', authMiddleware, estadisticasRoutes);
app.use('/api/usuarios', authMiddleware, usuariosRoutes);
app.use('/api/combustible', authMiddleware, combustibleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido' });
    }
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Seed default admin user
const seedAdmin = async () => {
  try {
    const adminExists = await Usuario.findOne({
      where: { email: process.env.ADMIN_EMAIL || 'admin@autoescuela.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await Usuario.create({
        nombre: process.env.ADMIN_NAME || 'Administrador',
        email: process.env.ADMIN_EMAIL || 'admin@autoescuela.com',
        password: hashedPassword,
      });
      console.log('✅ Usuario administrador creado por defecto');
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@autoescuela.com'}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      }
    }
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  }
};

// Start server
const start = async () => {
  try {
    // Wait for database connection with retries
    let retries = 10;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        break;
      } catch (err) {
        retries--;
        console.log(`⏳ Esperando base de datos... (${10 - retries}/10)`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    if (retries === 0) {
      throw new Error('No se pudo conectar a la base de datos después de 10 intentos');
    }

    // Sync models
    const syncEnabled = process.env.DB_SYNC !== 'false';
    const syncAlter = process.env.DB_SYNC_ALTER === 'true';

    if (syncEnabled) {
      await sequelize.sync({ alter: syncAlter });
      console.log(`✅ Modelos sincronizados con la base de datos${syncAlter ? ' (alter)' : ''}`);
    } else {
      console.log('ℹ️ Sincronización de modelos deshabilitada por configuración');
    }

    // Seed admin
    await seedAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
