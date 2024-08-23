// models/professional-posts.js
import mongoose from 'mongoose';

// Schema for location (place and pincode)
const locationSchema = new mongoose.Schema({
  place: { type: String },
  pincode: { type: Number },
});

// Schema for the product pricing details
const priceSchema = new mongoose.Schema({
  priceType: { type: String }, // No enum, free text field
  amount: { type: Number },
  isLaborOnly: { type: String }, // No enum, free text field
});

// Main Post schema
const postSchema = new mongoose.Schema({
  title: { type: String },
  captions: { type: String },
  tags: [{ type: String }], // Array of strings for tags
  location: locationSchema, // Location details with place and pincode
  priceDetails: priceSchema, // Price details with type, amount, and labor/material options
  images: [{ type: String }], // Array of strings to store image URLs
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who created the post
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
