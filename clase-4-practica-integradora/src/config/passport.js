import LocalStrategy from 'passport-local';
import { UserModel } from '../models/user.model.js';

export const initializePassport = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await UserModel.findByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }

          const ok = await UserModel.verifyPassword(password, user.password);
          if (!ok) {
            return done(null, false, { message: 'Error de autenticación' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};