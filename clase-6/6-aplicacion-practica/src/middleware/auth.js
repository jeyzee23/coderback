const passport = require('../config/passport');
const User = require('../models/user');
const { verifyAccessToken } = require('../utils/auth');

const AUTH_ERROR = { error: 'Token inválido o no proporcionado' };

// Autentica usando Authorization: Bearer <token>.
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(AUTH_ERROR);
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json(AUTH_ERROR);
  }
}

// Autentica usando el JWT guardado en la cookie authToken.
function authenticateFromCookie(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json(AUTH_ERROR);
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json(AUTH_ERROR);
  }
}

// Autentica con Passport JWT cuando queremos delegar la validación en passport-jwt.
function authenticateWithPassport(req, res, next) {
  const passportMiddleware = passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  });

  // Passport devuelve un middleware; lo ejecutamos con la request actual.
  passportMiddleware(req, res, next);
}

// Autoriza usando el rol que ya viene en req.user después de validar el JWT.
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
}

// Autoriza consultando MongoDB para reflejar cambios de rol inmediatamente.
function authorizeRolesFromDB(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user?.id).select('role');

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  authenticateJWT,
  authenticateFromCookie,
  authenticateWithPassport,
  authorizeRoles,
  authorizeRolesFromDB
};
