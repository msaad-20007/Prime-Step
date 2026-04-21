import { Router } from 'express';
import { sendOtp, verifyOtpAndRegister, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/send-otp', sendOtp);           // Step 1: send verification code
router.post('/verify-otp', verifyOtpAndRegister); // Step 2: verify + create account
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
