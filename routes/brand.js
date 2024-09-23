import express from 'express';
import { addBrand, approveBrand, listAllBrands } from '../controllers/brand.js'; // Adjust the path as necessary
import protect from '../middlewares/protect.js';
const router = express.Router();

// Route to add a new brand
router.post('/brands',protect, addBrand);

// Route for admin to approve a brand
router.patch('/brands/:brandId/approve',protect, approveBrand);

// Route to list all brands
router.get('/brands',protect, listAllBrands);

export default router;
