const express = require('express');
const {
  createAccessToken,
  getAuthCookieOptions,
  getClearCookieOptions
} = require('../utils/auth');
const router = express.Router();

const users = [{ id: 1, email: 'test@test.com', password: '123456' }];

// Devuelve el JWT en el cuerpo de la respuesta para enviarlo luego por el encabezado Authorization.
router.post('/login-header', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(existingUser => existingUser.email === email && existingUser.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);
  res.json({ token });
});

// Guarda el JWT en una cookie httpOnly para que el navegador la envíe automáticamente.
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

// Limpia la cookie de autenticación para cerrar la sesión del lado del navegador.
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', getClearCookieOptions());
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
