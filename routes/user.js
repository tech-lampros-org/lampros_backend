import express from 'express';
import { requestOtp, verifyOtp, completeBasic, completeRegistration, getProfile, uploadImage, uploadImages, filterUsersWithProjectsOrProducts ,deleteAccount,numCheck } from '../controllers/user.js';
import upload from '../config/multerConfig.js';
import { protect } from '../middlewares/protect.js'; 

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/basic-registration', completeBasic);
router.post('/complete-registration', completeRegistration);
router.get('/protected-route', protect, getProfile);
router.get('/user-filter',protect,filterUsersWithProjectsOrProducts )
router.delete('/delete',protect,deleteAccount)


// Image upload route
router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/upload-images', upload.array('image', 10), uploadImages);
router.get('/check/:number', numCheck)

export default router;
