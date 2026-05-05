const express = require('express');
const authenticate = require('../middleware/auth');
const { createAccessToken } = require('../utils/jwt');
const router = express.Router();

// Simulamos usuarios en memoria para este ejemplo
const users = [];

// Registra un usuario de prueba en memoria para poder obtener un JWT.
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (users.find(existingUser => existingUser.email === email)) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  const user = { id: Date.now(), email, password };
  users.push(user);

  res.status(201).json({ message: 'Usuario registrado', user: { id: user.id, email: user.email } });
});

// Valida email y contraseña, y devuelve un JWT para usar en rutas protegidas.
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(existingUser => existingUser.email === email && existingUser.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);

  res.json({ token });
});

// Devuelve el perfil solo si Passport valida correctamente el JWT enviado por encabezado Authorization.
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida accedida', user: req.user });
});

module.exports = router;
