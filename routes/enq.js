import express from 'express';
import { createEnquiry } from '../controllers/enq.js';

const router = express.Router();

// POST route to create an enquiry
router.post('/enquiries', createEnquiry);

export default router;
