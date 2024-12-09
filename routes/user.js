import express from 'express';
import { requestOtp, verifyOtp, completeBasic, update, completeRegistration, getProfile, uploadImage, uploadImages, filterUsersWithProjectsOrProducts ,deleteAccount } from '../controllers/user.js';
import upload from '../config/multerConfig.js';
import { protect } from '../middlewares/protect.js'; 

const router = express.Router();

const conditionalProtect = (req, res, next) => {
    if (req.query.user === 'guest') {
      return next(); // Skip protect middleware if user=guest
    }
    return protect(req, res, next); // Apply protect middleware otherwise
  };

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/basic-registration', completeBasic);
router.post('/complete-registration', completeRegistration);
router.put('/update',protect, update);
router.get('/protected-route', protect, getProfile);
router.get('/user-filter', conditionalProtect, filterUsersWithProjectsOrProducts);
router.delete('/delete',protect,deleteAccount)



// Image upload route
router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/upload-images', upload.array('image', 10), uploadImages);

export default router;
