import mongoose from 'mongoose';
import crypto from 'crypto';

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false }, // Track OTP verification status
  createdAt: { type: Date, default: Date.now }, // Track when the OTP was created
});

otpSchema.methods.generateOtp = function() {
  // this.otp = crypto.randomInt(1000, 9999).toString();
  this.otp = '5555'
  this.expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
};

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
