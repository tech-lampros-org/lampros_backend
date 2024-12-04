import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Define possible models that can be reviewed
const allowedModels = ['Product', 'ProProject'];

const reviewSchema = new mongoose.Schema(
  {
    // Reference to either Product or ProProject
    reviewable: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      required: true,
      enum: allowedModels,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null, // Null indicates it's a top-level review
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      // Make rating optional by not setting `required: true`
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    // Array of replies
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);



// Static method to calculate average rating and total reviews for a reviewable item
reviewSchema.statics.calculateAverageRating = async function (reviewableId, onModel) {
  const result = await this.aggregate([
    { $match: { reviewable: mongoose.Types.ObjectId(reviewableId), rating: { $exists: true } } },
    {
      $group: {
        _id: '$reviewable',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (result.length > 0) {
      const { averageRating, totalReviews } = result[0];
      if (onModel === 'Product') {
        await mongoose.model('Product').findByIdAndUpdate(reviewableId, {
          averageRating: averageRating.toFixed(1),
          totalReviews,
        });
      } else if (onModel === 'ProProject') {
        await mongoose.model('ProProject').findByIdAndUpdate(reviewableId, {
          averageRating: averageRating.toFixed(1),
          totalReviews,
        });
      }
    } else {
      // If no reviews with ratings, reset the fields
      if (onModel === 'Product') {
        await mongoose.model('Product').findByIdAndUpdate(reviewableId, {
          averageRating: 0,
          totalReviews: 0,
        });
      } else if (onModel === 'ProProject') {
        await mongoose.model('ProProject').findByIdAndUpdate(reviewableId, {
          averageRating: 0,
          totalReviews: 0,
        });
      }
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

// Middleware to update average rating after saving a review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.reviewable, this.onModel);
});

// Middleware to update average rating before removing a review
reviewSchema.pre('remove', function () {
  this.constructor.calculateAverageRating(this.reviewable, this.onModel);
});

// Apply pagination plugin
reviewSchema.plugin(mongoosePaginate);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
