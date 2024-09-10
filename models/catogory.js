import mongoose from 'mongoose';

// Schema for images
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },  // Image URL
  altText: { type: String },              // Alternative text for the image
});

// Sub-Type Schema (with image)
const subTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Sub-Type name
  image: imageSchema,                       // Image for sub-type
});

// Type Schema (with sub-types)
const typeSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Type name
  subTypes: [subTypeSchema],                // Array of sub-types
});

// SubCategory Schema
const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },   // SubCategory name
  description: { type: String },            // Description of the subcategory
  image: imageSchema,                       // Image for subcategory
  types: [typeSchema],                      // Array of types with sub-types
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },   // Category name
  description: { type: String },            // Description of the category
  image: imageSchema,                       // Image for category
  subCategories: [subCategorySchema],       // Array of subcategories
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
