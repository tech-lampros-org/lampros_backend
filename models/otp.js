import mongoose from 'mongoose';
import crypto from 'crypto';

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false }, // Track OTP verification status
});

otpSchema.methods.generateOtp = function() {
//   this.otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    this.otp = '3534'
  this.expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
};

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
