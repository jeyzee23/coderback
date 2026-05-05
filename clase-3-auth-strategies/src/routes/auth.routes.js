import { Router } from 'express';
import { register, login, current, logout } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Declaración de rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticateJWT, current);
router.post('/logout', logout);

export default router;
