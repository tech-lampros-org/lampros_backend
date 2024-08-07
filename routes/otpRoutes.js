import express from 'express';
import { requestOtp, verifyOtp } from '../controllers/otpController.js';

const router = express.Router();

// Route to request OTP
router.post('/request-otp', requestOtp);

// Route to verify OTP and handle registration or login
router.post('/verify-otp', verifyOtp);

export default router;
