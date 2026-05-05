const express = require('express');
const passport = require('../config/passport');
const { findUserByCredentials } = require('../repositories/userRepository');
const { createAccessToken } = require('../utils/jwt');
const router = express.Router();

function buildAuthErrorResponse(passportInfo) {
  const message = passportInfo?.message || '';
  const name = passportInfo?.name || '';

  if (message.includes('No auth token')) {
    return { status: 401, body: { message: 'Token no proporcionado' } };
  }

  if (name === 'TokenExpiredError' || message.includes('expired')) {
    return { status: 401, body: { message: 'Token expirado' } };
  }

  if (message.includes('no encontrado')) {
    return { status: 404, body: { message: 'Usuario no encontrado' } };
  }

  return { status: 401, body: { message: 'Token inválido' } };
}

// Valida credenciales y devuelve un JWT para probar la ruta protegida.
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByCredentials(email, password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = createAccessToken(user);

  res.json({ token });
});

// Ruta protegida con custom callback para controlar manualmente cada error de Passport.
router.get('/profile', (req, res, next) => {
  // passportInfo trae detalles útiles de Passport, por ejemplo token expirado, ausente o inválido.
  const passportMiddleware = passport.authenticate('jwt', { session: false }, (err, user, passportInfo) => {
    if (err) {
      console.log('[AUTH] Error interno:', err.message);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    if (!user) {
      const message = passportInfo?.message || passportInfo?.name || 'Token inválido';
      const response = buildAuthErrorResponse(passportInfo);

      console.log('[AUTH] Fallido:', message);

      return res.status(response.status).json(response.body);
    }

    console.log('[AUTH] Exitoso - Usuario:', user.email);
    return res.status(200).json({ message: 'Datos del usuario', user });
  });

  // Passport devuelve un middleware; lo ejecutamos con la request actual.
  passportMiddleware(req, res, next);
});

module.exports = router;
