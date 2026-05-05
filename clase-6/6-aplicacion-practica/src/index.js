require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resource');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Agrupa registro, inicio de sesión y cierre de sesión.
app.use('/auth', authRoutes);
// Agrupa rutas públicas, privadas y restringidas por rol.
app.use('/resources', resourceRoutes);

// Conexión a MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_jwt_db';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Conectado a MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
