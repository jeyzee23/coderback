import passport from 'passport';
import { config } from '../config/config.js';
import { UserModel } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { AppError, asyncHandler } from '../middlewares/error.middleware.js';

export const register = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    throw new AppError('Faltan datos obligatorios', 400);
  }

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new AppError('El email ya está registrado', 409);
  }

  const user = await UserModel.create({ first_name, last_name, email, age, password });
  const { password: _, ...safeUser } = user;

  return res.status(201).json({ status: 'success', payload: safeUser });
});

export const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
    if (!user) {
      return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });
    }

    UserModel.updateLastConnection(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      role: user.role,
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      })
      .json({ status: 'success', token });
  })(req, res, next);
};

export const current = (req, res) => {
  return res.json({ status: 'success', user: req.user });
};

export const logout = (_req, res) => {
  res.clearCookie('token').json({ status: 'success', message: 'Sesión cerrada' });
};