import express from 'express';
import { createEnquiry,getAllEnquiries } from '../controllers/enq.js';

const router = express.Router();

// POST route to create an enquiry
router.post('/enquiries', createEnquiry);
router.get('/AllEnquiries', getAllEnquiries)

export default router;
