import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Brand name
  description: { type: String },  // Brand description
  imageUrl: { type: String },     // Brand image URL
  adminApproved: { type: Boolean, default: false },  // Admin approval status
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },  // Reference to the user who created the brand
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
