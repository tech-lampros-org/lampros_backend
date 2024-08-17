import express from 'express';
import { getPincodeDetails } from '../controllers/utils.js';

const router = express.Router();

router.get('/serch-pincode',getPincodeDetails);

export default router;