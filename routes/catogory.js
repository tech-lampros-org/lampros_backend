import express from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategories,
} from '../controllers/catogory.js';

const router = express.Router();

// Category routes
router.post('/category', createCategory); // Create a new category
router.put('/category/:categoryId', updateCategory); // Update category
router.delete('/category/:categoryId', deleteCategory); // Delete category
router.get('/category', getCategories); // Get all categories
router.get('/category/:categoryId', getCategoryById); // Get category by ID

// SubCategory routes
router.post('/category/:categoryId/subcategory', addSubCategory); // Add subcategory
router.put('/category/:categoryId/subcategory/:subCategoryId', updateSubCategory); // Update subcategory
router.delete('/category/:categoryId/subcategory/:subCategoryId', deleteSubCategory); // Delete subcategory
router.get('/category/:categoryId/subcategories', getSubCategories); // Get all subcategories of a category

export default router;
