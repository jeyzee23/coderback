import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

router.get('/', (_req, res) => {
  res.json({
    status: 'success',
    message: 'API Semana 4 - Backend II | Autenticación con JWT',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      current: 'GET /api/auth/current',
      logout: 'POST /api/auth/logout',
      profile: 'GET /api/users/profile',
      listUsers: 'GET /api/users (admin)',
    },
  });
});

export default router;
