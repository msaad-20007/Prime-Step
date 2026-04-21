import { Router } from 'express';
import { getAllUsers, deleteUser } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, adminOnly, getAllUsers);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
