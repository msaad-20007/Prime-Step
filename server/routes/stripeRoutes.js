import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentIntent } from '../controllers/stripeController.js';

const router = Router();

router.post('/create-payment-intent', protect, createPaymentIntent);

export default router;
