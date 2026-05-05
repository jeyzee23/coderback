require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resource');

const app = express();

app.use(express.json());

// Agrupa el login que genera tokens con rol.
app.use('/auth', authRoutes);
// Agrupa rutas públicas, privadas y restringidas por rol.
app.use('/resources', resourceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
