import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Schema for Answer
const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Answer content is required'],
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null, // Null indicates it's a top-level answer
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
    // Optional fields for additional functionalities
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index to improve query performance for answers
answerSchema.index({ question: 1, createdAt: -1 });

// Apply pagination plugin
answerSchema.plugin(mongoosePaginate);

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
