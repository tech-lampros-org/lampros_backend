import express from 'express';
import { 
  addProduct, 
  listAllProducts, 
  listUserProducts, 
  filterProducts, 
  searchProducts, 
  updateProduct, 
  listAllProductsByIds 
} from '../controllers/pro-products.js';
import { protect } from '../middlewares/protect.js'; 

// Initialize the router
const router = express.Router();

// Custom middleware to conditionally apply 'protect'
const conditionalProtect = (req, res, next) => {
  if (req.query.user === 'guest') {
    return next(); // Skip protect middleware if user=guest
  }
  return protect(req, res, next); // Apply protect middleware otherwise
};

// Route to add a new product (POST /api/products)
router.post('/products', protect, addProduct);

// Route to list all products (GET /api/products/all)
router.get('/products/all', conditionalProtect, listAllProducts);
router.post('/products/ids', protect, listAllProductsByIds);

// Route to update a product by its ID (PUT /api/product/:productId)
router.put('/product/:productId', protect, updateProduct);

// Route to list products created by the authenticated user (GET /api/products/user)
router.get('/products/user', protect, listUserProducts);

// Route to filter products based on query parameters (GET /api/products/filter)
router.get('/products/filter', conditionalProtect, filterProducts);

// Route to search products based on query parameters (GET /api/products/search)
router.get('/products/search', conditionalProtect, searchProducts);

export default router;
