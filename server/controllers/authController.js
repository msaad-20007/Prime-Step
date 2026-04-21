import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import OtpCode from '../models/OtpCode.js';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPaymentConfirmedEmail,
} from '../utils/sendEmail.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ─── Step 1: Send OTP to email ────────────────────────────────────────────────
// POST /api/auth/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check email not already registered
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    // Hash password now so we can store it temporarily
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete any previous OTP for this email
    await OtpCode.deleteMany({ email });

    const otp = generateOtp();
    await OtpCode.create({ email, otp, name, password: hashedPassword });

    // Try to send OTP email — if SMTP fails, return a clear error
    try {
      await sendOtpEmail({ email, otp });
    } catch (emailErr) {
      console.error('[Email] Failed to send OTP:', emailErr.message);
      // Clean up the OTP record since we couldn't deliver it
      await OtpCode.deleteMany({ email });
      return res.status(500).json({
        message: `Could not send verification email to ${email}. Please check the email address is correct, or contact support.`,
      });
    }

    res.status(200).json({ message: `Verification code sent to ${email}` });
  } catch (err) {
    next(err);
  }
};

// ─── Step 2: Verify OTP and create account ────────────────────────────────────
// POST /api/auth/verify-otp
export const verifyOtpAndRegister = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await OtpCode.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new code.' });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    // Double-check email not taken (race condition guard)
    const exists = await User.findOne({ email });
    if (exists) {
      await OtpCode.deleteMany({ email });
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user with pre-hashed password (skip bcrypt pre-save hook)
    const user = new User({ name: record.name, email, password: record.password });
    user.$skipPasswordHash = true; // flag checked in pre-save hook
    await user.save();

    // Clean up OTP
    await OtpCode.deleteMany({ email });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ name: user.name, email: user.email }).catch(err =>
      console.error('[Email] Welcome email failed:', err.message)
    );

    res.status(201).json({ token: signToken(user._id), user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ token: signToken(user._id), user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
export const getMe = (req, res) => {
  res.status(200).json(req.user);
};

// ─── Exported email helpers for use in other controllers ─────────────────────
export { sendPaymentConfirmedEmail };
