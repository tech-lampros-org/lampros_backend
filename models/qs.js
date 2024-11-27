import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Schema for Question
const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
    // Optional fields for additional functionalities
    views: {
      type: Number,
      default: 0,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);



// Apply pagination plugin
questionSchema.plugin(mongoosePaginate);

const Question = mongoose.model('Question', questionSchema);

export default Question;
