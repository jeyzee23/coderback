import { UserModel } from '../models/user.model.js';
import { AppError, asyncHandler } from '../middlewares/error.middleware.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await UserModel.list();
  return res.json({ status: 'success', payload: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const user = await UserModel.findById(uid);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return res.json({ status: 'success', payload: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { first_name, last_name, age } = req.body;

  const user = await UserModel.findById(uid);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  const updated = await UserModel.update(uid, { first_name, last_name, age });
  return res.json({ status: 'success', payload: updated });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const user = await UserModel.findById(uid);
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  await UserModel.delete(uid);
  return res.json({ status: 'success', message: `Usuario ${uid} eliminado` });
});