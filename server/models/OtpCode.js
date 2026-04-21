import mongoose from 'mongoose';

// Stores temporary OTP codes for email verification
// TTL index auto-deletes documents after 10 minutes
const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  otp:       { type: String, required: true },
  name:      { type: String, required: true },
  password:  { type: String, required: true }, // pre-hashed by bcrypt before storing
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min TTL
});

const OtpCode = mongoose.model('OtpCode', otpSchema);
export default OtpCode;
