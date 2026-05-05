import { verifyToken } from '../utils/jwt.js';

const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
};

export const authenticateJWT = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token no provisto' });
  }
  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ status: 'error', message: 'No autorizado' });
  }
  return next();
};

export const optionalAuth = (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      req.user = null;
    }
  }
  return next();
};