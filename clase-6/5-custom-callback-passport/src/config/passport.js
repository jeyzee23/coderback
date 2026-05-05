const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { findUserById } = require('../repositories/userRepository');
const { getJwtSecret } = require('../utils/jwt');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getJwtSecret()
};

passport.use(new JwtStrategy(opts, (payload, done) => {
  const user = findUserById(payload.sub);
  if (user) {
    return done(null, user);
  }
  return done(null, false, { message: 'Usuario no encontrado' });
}));

module.exports = passport;
