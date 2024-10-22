import mongoose from 'mongoose';

// Schema for project location (place and pincode)
const projectLocationSchema = new mongoose.Schema({
  place: { type: String },
  pincode: { type: Number },
});



// Schema for project images categorized by different types
const projectImagesSchema = new mongoose.Schema({
  category: { type: String }, // Category of the image (e.g., front view, interior)
  url: { type: String },      // Image URL
});

// Main ProProject schema
const proProjectSchema = new mongoose.Schema({
  sellerName: { type: String, required: true }, // Seller name is required
  sellerPhoneNumber: { type: String, required: true }, // Seller phone number is required
  projectType: { type: String }, // Free text field (e.g., Residential, Commercial)
  projectLocation: projectLocationSchema, // Location details with place and pincode
  constructionType: { type: String }, // Free text field (e.g., New, Renovation)
  houseType: { type: String }, // Free text field (e.g., Apartment, Villa)
  style: { type: String }, // Free text field (e.g., Modern, Traditional)
  title: { type: String },
  layout: { type: String }, // Free text field (e.g., 2BHK, 3BHK)
  numberOfBathrooms: { type: Number },
  areaSquareFeet: { type: Number }, // Area in square feet
  plotSize: { type: Number }, // Plot size in square/cents
  scope: { type: String }, // Free text field for project scope
  cost: { type: Number }, // Cost of the project
  about: { type: String }, // Description of the project
  images: [projectImagesSchema], // Array of categorized images
  floors: { type: Number }, // Number of floors
  numberOfParkings: { type: Number }, // Number of parking spaces
  propertyOwnership: { type: String }, // Free text field (e.g., Owned, Leased)
  transactionTypeForProperty: { type: String }, // Free text field (e.g., Sale, Rent)
  plotSizeForProperty: { type: Number }, // Plot size specific to property in square/cents
  boundaryWall: { type: Boolean }, // Whether there is a boundary wall or not
  cornerProperty: { type: Boolean }, // Whether it is a corner property or not
  propertyAge: { type: Number }, // Age of the property in years
  tags: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }, // Automatically set the creation date
  updatedAt: { type: Date, default: Date.now }, // Automatically set the update date
}, { timestamps: true });

const ProProject = mongoose.model('ProProject', proProjectSchema);

export default ProProject;
