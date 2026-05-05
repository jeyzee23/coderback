require('dotenv').config();
const express = require('express');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(passport.initialize());

// Agrupa login y perfil protegido con custom callback de Passport.
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
