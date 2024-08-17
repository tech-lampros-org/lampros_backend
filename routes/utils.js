import express from 'express';
import { getPincodeDetails } from '../controllers/utils.js';

const router = express.Router();

router.get('/serch-picode',getPincodeDetails);

export default router;