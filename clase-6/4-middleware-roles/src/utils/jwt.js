const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_fallback_key_32chars';
}

function createAccessToken(user) {
  return jwt.sign(
    // sub = "subject": campo estándar de JWT para identificar al usuario dueño del token.
    { sub: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '1h' }
  );
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, getJwtSecret());

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role
  };
}

module.exports = { createAccessToken, verifyAccessToken };
