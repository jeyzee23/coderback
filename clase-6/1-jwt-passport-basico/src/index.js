require('dotenv').config();
const express = require('express');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(passport.initialize());

// Agrupa las rutas de registro, login y perfil.
app.use('/auth', authRoutes);

// Ruta protegida para comprobar que el JWT permite acceder a contenido privado.
app.get('/dashboard', authenticate, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
