import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const generateToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn }); // crear el token para el usuario

export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);
