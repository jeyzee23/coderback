const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const { getJwtSecret } = require('../utils/auth');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getJwtSecret()
};

passport.use(new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false, { message: 'Usuario no encontrado' });
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
