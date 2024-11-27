import Review from '../models/review.js';
import Product from '../models/pro-products.js';
import ProProject from '../models/pro-projects.js';

// Utility function to determine the model based on onModel field
const getReviewableModel = (onModel) => {
  if (onModel === 'Product') return Product;
  if (onModel === 'ProProject') return ProProject;
  return null;
};

// Create a new review or reply
export const createReview = async (req, res) => {
  try {
    const { onModel, reviewableId, rating, comment, parentId } = req.body;
    const userId = req.user; // Assuming user is authenticated and user ID is in req.user

    // Validate onModel
    if (!['Product', 'ProProject'].includes(onModel)) {
      return res.status(400).json({ message: 'Invalid model specified for review' });
    }

    // Check if the reviewable item exists
    const ReviewableModel = getReviewableModel(onModel);
    const reviewableItem = await ReviewableModel.findById(reviewableId);
    if (!reviewableItem) {
      return res.status(404).json({ message: `${onModel} not found` });
    }

    // If it's a reply, ensure the parent review exists and belongs to the same reviewable item
    let parentReview = null;
    if (parentId) {
      parentReview = await Review.findById(parentId);
      if (!parentReview) {
        return res.status(404).json({ message: 'Parent review not found' });
      }
      if (parentReview.reviewable.toString() !== reviewableId || parentReview.onModel !== onModel) {
        return res.status(400).json({ message: 'Parent review does not belong to the specified reviewable item' });
      }
    }

    // Create the review
    const review = new Review({
      reviewable: reviewableId,
      onModel,
      user: userId,
      rating, // Optional
      comment,
      parent: parentId || null,
      createdBy: req.user,
    });

    await review.save();

    // If it's a reply, add it to the parent's replies array
    if (parentReview) {
      parentReview.replies.push(review._id);
      await parentReview.save();
    }

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all top-level reviews for a specific reviewable item with pagination and nested replies
export const getReviews = async (req, res) => {
  try {
    const { onModel, reviewableId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate onModel
    if (!['Product', 'ProProject'].includes(onModel)) {
      return res.status(400).json({ message: 'Invalid model specified for review' });
    }

    // Check if the reviewable item exists
    const ReviewableModel = getReviewableModel(onModel);
    const reviewableItem = await ReviewableModel.findById(reviewableId);
    if (!reviewableItem) {
      return res.status(404).json({ message: `${onModel} not found` });
    }

    // Fetch top-level reviews (where parent is null)
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'fname lname profileImage' },
        { path: 'replies', populate: { path: 'user', select: 'fname lname profileImage' } },
      ],
    };

    const reviews = await Review.paginate(
      { reviewable: reviewableId, parent: null },
      options
    );

    res.status(200).json({ ...reviews, reviewableItem });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a review or reply
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this review' });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete a review or reply
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user;
    const userRole = req.user.role; // Assuming user role is available

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the user or if the user is an admin
    // if (review.user.toString() !== userId.toString() && userRole !== 'Admin') {
    //   return res.status(403).json({ message: 'Unauthorized to delete this review' });
    // }

    // If the review has a parent, remove this review from the parent's replies array
    if (review.parent) {
      const parentReview = await Review.findById(review.parent);
      if (parentReview) {
        parentReview.replies.pull(review._id);
        await parentReview.save();
      }
    }

    // Remove all child replies recursively (optional)
    const removeReplies = async (parentId) => {
      const childReviews = await Review.find({ parent: parentId });
      for (const child of childReviews) {
        await removeReplies(child._id);
        await child.remove();
      }
    };

    await removeReplies(review._id);

    // Remove the review
    await review.remove();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single review by ID with nested replies
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('user', 'fname lname profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'fname lname profileImage' },
      });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
