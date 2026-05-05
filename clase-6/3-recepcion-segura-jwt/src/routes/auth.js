const express = require('express');
const {
  createAccessToken,
  getAuthCookieOptions,
  getClearCookieOptions
} = require('../utils/auth');
const router = express.Router();

const users = [{ id: 1, email: 'test@test.com', password: '123456' }];

// Devuelve el JWT en JSON para que el cliente lo mande por el encabezado Authorization.
router.post('/login-header', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(existingUser => existingUser.email === email && existingUser.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);
  res.json({ token });
});

// Crea la cookie authToken con el JWT y opciones de seguridad.
router.post('/login-cookie', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(existingUser => existingUser.email === email && existingUser.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);

  res.cookie('authToken', token, getAuthCookieOptions());

  res.json({ message: 'Inicio de sesión exitoso con cookie' });
});

// Elimina la cookie authToken para finalizar el acceso autenticado por cookie.
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', getClearCookieOptions());
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
