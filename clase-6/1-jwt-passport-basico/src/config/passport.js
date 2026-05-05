const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { getJwtSecret } = require('../utils/jwt');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getJwtSecret()
};

passport.use(new JwtStrategy(opts, (payload, done) => {
  // En una app real, buscarías el usuario en la base de datos
  // Aquí simulamos que el usuario existe
  const user = { id: payload.sub, email: payload.email };
  return done(null, user);
}));

module.exports = passport;
