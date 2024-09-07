import mongoose from 'mongoose';

// Schema for category images
const categoryImagesSchema = new mongoose.Schema({
  url: { type: String, required: true }, // Image URL
  altText: { type: String },             // Alternative text for the image
});

// SubCategory Schema
const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },   // SubCategory name
  description: { type: String },            // Description of the subcategory
  image: categoryImagesSchema,              // Image for subcategory
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },   // Category name
  description: { type: String },            // Description of the category
  image: categoryImagesSchema,              // Image for category
  subCategories: [subCategorySchema],       // Array of subcategories
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
