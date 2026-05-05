import { UserModel } from '../models/user.model.js';

export const listUsers = async (_req, res) => {
  return res.json({ status: 'success', payload: await UserModel.list() });
};

export const getProfile = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }
  const { password, ...safeUser } = user;
  return res.json({ status: 'success', payload: safeUser });
};
