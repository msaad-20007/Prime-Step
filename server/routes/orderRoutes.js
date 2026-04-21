import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
