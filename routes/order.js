import express from 'express';
import { createOrder, updateOrderQuantity } from '../controllers/order.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Route to create an order
router.post('/create', protect, createOrder);

// Route to update the quantity of an order
router.put('/update-quantity', protect, updateOrderQuantity);

export default router;
