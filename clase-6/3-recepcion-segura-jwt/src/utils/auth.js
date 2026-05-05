const jwt = require('jsonwebtoken');

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_fallback_key_32chars';
}

function createAccessToken(user) {
  return jwt.sign(
    // sub = "subject": campo estándar de JWT para identificar al usuario dueño del token.
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getAuthCookieOptions() {
  return {
    // httpOnly impide leer la cookie desde JavaScript y reduce el impacto de XSS (cross-site scripting).
    httpOnly: true,
    // En local queda false porque normalmente no usamos HTTPS; en producción debe ser true.
    secure: process.env.NODE_ENV === 'production',
    // Lax mitiga CSRF sin romper la navegación normal desde enlaces externos.
    sameSite: 'Lax',
    maxAge: ONE_HOUR_IN_MS
  };
}

function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Debe coincidir con la cookie original para que el navegador la borre correctamente.
    sameSite: 'Lax'
  };
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
  getAuthCookieOptions,
  getClearCookieOptions
};
