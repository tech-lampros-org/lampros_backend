import express from 'express';
import { requestOtp, verifyOtp, completeRegistration, login, getProfile } from '../controllers/user.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-registration', completeRegistration);
router.get('/protected-route', protect, getProfile);

export default router;
