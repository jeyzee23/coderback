require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { authFromHeader, authFromCookie } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Agrupa las rutas que entregan JWT por encabezado Authorization o cookie.
app.use('/auth', authRoutes);

// Ruta protegida que valida Authorization: Bearer <token>.
app.get('/protected-header', authFromHeader, (req, res) => {
  res.json({ message: 'Acceso vía encabezado Authorization', user: req.user });
});

// Ruta protegida que valida el JWT recibido en la cookie authToken.
app.get('/protected-cookie', authFromCookie, (req, res) => {
  res.json({ message: 'Acceso vía cookie', user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
