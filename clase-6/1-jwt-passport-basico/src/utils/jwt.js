const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_fallback_key_32chars';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '1h';
}

function createAccessToken(user) {
  return jwt.sign(
    // sub = "subject": campo estándar de JWT para identificar al usuario dueño del token.
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );
}

module.exports = { createAccessToken, getJwtSecret };
