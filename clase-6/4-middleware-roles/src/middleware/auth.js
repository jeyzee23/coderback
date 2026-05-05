const { findUserById } = require('../repositories/userRepository');
const { verifyAccessToken } = require('../utils/jwt');

// Middleware: autenticación JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Middleware: verificar rol desde token
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}

// Middleware: verificar rol consultando la base de datos
function requireRoleFromDB(role) {
  return async (req, res, next) => {
    const user = findUserById(req.user.id);
    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = { authenticateJWT, requireRole, requireRoleFromDB };
