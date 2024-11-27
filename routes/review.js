import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewById,
} from '../controllers/review.js';
import { protect as authenticateUser } from '../middlewares/protect.js'; // Middleware to authenticate user

const router = express.Router();

// Route: POST /api/reviews
// Description: Create a new review or reply
router.post('/', authenticateUser, createReview);

// Route: GET /api/reviews
// Description: Get all top-level reviews for a specific reviewable item
// Query parameters: onModel, reviewableId, page, limit
router.get('/', getReviews);

// Route: GET /api/reviews/:reviewId
// Description: Get a single review by ID
router.get('/:reviewId', getReviewById);

// Route: PUT /api/reviews/:reviewId
// Description: Update a review
router.put('/:reviewId', authenticateUser, updateReview);

// Route: DELETE /api/reviews/:reviewId
// Description: Delete a review
router.delete('/:reviewId', authenticateUser, deleteReview);

export default router;
