import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/users.controller.js';
import { authenticateJWT, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT, authorize('admin'), getUsers);
router.get('/:uid', authenticateJWT, getUserById);
router.put('/:uid', authenticateJWT, updateUser);
router.delete('/:uid', authenticateJWT, authorize('admin'), deleteUser);

export default router;