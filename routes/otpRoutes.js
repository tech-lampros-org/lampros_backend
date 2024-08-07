import express from 'express';
import { requestOtp, verifyOtp } from '../controllers/otpController.js';
import { validateOtpHomeowner,validateCreateHomeowner } from '../middlewares/inputValidation.js'

const router = express.Router();

// Route to request OTP
router.post('/request-otp',validateOtpHomeowner, requestOtp);

// Route to verify OTP and handle registration or login
router.post('/verify-otp',validateCreateHomeowner, verifyOtp);

export default router;
