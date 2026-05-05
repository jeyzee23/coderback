import { UserModel } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Faltan datos obligatorios' });
  }

  if (await UserModel.findByEmail(email)) {
    return res.status(409).json({ status: 'error', message: 'El email ya está registrado' });
  }

  const user = await UserModel.create({ first_name, last_name, email, age, password });
  const { password: _, ...safeUser } = user;

  return res.status(201).json({ status: 'success', payload: safeUser });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email y password son requeridos' });
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
  }

  const ok = await UserModel.verifyPassword(password, user.password);
  if (!ok) {
    return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    role: user.role,
  });

  // Estrategia híbrida: devolvemos el token en el body y también lo seteamos como cookie httpOnly.
  res
    .cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    })
    .json({ status: 'success', token });
};

export const current = (req, res) => {
  return res.json({ status: 'success', user: req.user });
};

export const logout = (_req, res) => {
  res.clearCookie('token').json({ status: 'success', message: 'Sesión cerrada' });
};
