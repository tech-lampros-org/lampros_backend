import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/order.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Route to create an order
router.post('/', protect, createOrder);

// Route to get all orders for the logged-in user
router.get('/', protect, getOrders);

// Route to get a specific order by ID
router.get('/:orderId', protect, getOrderById);

// Route to update an order (quantity or status)
router.put('/:orderId', protect, updateOrder);

// Route to delete an order
router.delete('/:orderId', protect, deleteOrder);

export default router;
