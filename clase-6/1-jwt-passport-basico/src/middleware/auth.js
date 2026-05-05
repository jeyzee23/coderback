const passport = require('../config/passport');

function authenticate(req, res, next) {
  const passportMiddleware = passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno' });
    }
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    req.user = user;
    next();
  });

  // Passport devuelve un middleware; lo ejecutamos con la request actual.
  passportMiddleware(req, res, next);
}

module.exports = authenticate;
