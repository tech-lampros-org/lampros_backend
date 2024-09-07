import express from 'express';
import { addProduct, listAllProducts, listUserProducts, filterProducts } from '../controllers/pro-products.js';
import { protect } from '../middlewares/protect.js'; 

// Initialize the router
const router = express.Router();

// Route to add a new product (POST /api/products)
router.post('/products', protect, addProduct);

// Route to list all products (GET /api/products/all)
router.get('/products/all', protect, listAllProducts);

// Route to list products created by the authenticated user (GET /api/products/user)
router.get('/products/user', protect, listUserProducts);

// Route to filter products based on query parameters (GET /api/products/filter)
router.get('/products/filter', protect, filterProducts);

export default router;
