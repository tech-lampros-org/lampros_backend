// routes/deliveryAddressRoutes.js
import express from 'express';
import {
  addDeliveryAddress,
  getDeliveryAddresses,
  getDeliveryAddressById,
  updateDeliveryAddress,
  deleteDeliveryAddress,
} from '../controllers/deliveryAddress.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Apply the protect middleware to all routes in this router
router.use(protect);

// Route to add a new delivery address
router.post('/', addDeliveryAddress);

// Route to get all delivery addresses
router.get('/', getDeliveryAddresses);

// Route to get a specific delivery address by ID
router.get('/:addressId', getDeliveryAddressById);

// Route to update a delivery address by ID
router.put('/:addressId', updateDeliveryAddress);

// Route to delete a delivery address by ID
router.delete('/:addressId', deleteDeliveryAddress);

export default router;
