import { Router } from 'express';
import { listUsers, getProfile } from '../controllers/users.controller.js';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT, authorize('admin'), listUsers);
router.get('/profile', authenticateJWT, getProfile);

export default router;
