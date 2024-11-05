import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Schema for product images
const productImagesSchema = new mongoose.Schema({
  category: { type: String }, // Category of the image (e.g., front view, side view)
  url: { type: String },      // Image URL
});

// Schema for seller details
const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Seller name
  phoneNumber: { type: String, required: true }, // Seller phone number
  location: { type: String }, // Seller location
});

// Schema for technical details of the product
const technicalDetailsSchema = new mongoose.Schema({
  brand: { type: String },       // Brand of the product
  color: { type: String },       // Product color
  material: { type: String },    // Material used in the product
  productDimensions: {           // Dimensions of the product (Width, Height, Depth)
    width: { type: Number },
    height: { type: Number },
    depth: { type: Number },
  },
  weight: { type: Number },      // Weight of the product
  baseWidth: { type: Number },   // Base width
  style: { type: String },       // Style of the product
  installationType: { type: String }, // Installation type
  finishType: { type: String },  // Finish type
  drainType: { type: String },   // Drain type
  seatMaterial: { type: String },// Material of the seat
  shape: { type: String },       // Shape of the product
  specialFeatures: { type: String }, // Special features
  productModelNumber: { type: String }, // Product model number
  asinNumber: { type: String },   // ASIN number
  productCareInstructions: { type: String } // Product care instructions
});


// Schema for manufacture details
const manufactureDetailsSchema = new mongoose.Schema({
  countryOfOrigin: { type: String }, // Country of origin
  manufacturer: { type: String },    // Manufacturer details
  deliveryCharge: { type: Number },  // Delivery charges
});

// Schema for product warranty and certification details
const warrantyAndCertificationsSchema = new mongoose.Schema({
  warrantyDuration: {
    months: { type: Number, default: 0 }, // Warranty duration in months
    years: { type: Number, default: 0 }   // Warranty duration in years
  },
  isoCertified: { type: Boolean },        // Whether ISO certified
  warranty: { type: Boolean }              // Warranty available or not
});


// Main Product schema
const productSchema = new mongoose.Schema({
  seller: sellerSchema, // Seller details
  name: { type: String, required: true }, // Product name
  code: { type: String, unique: true }, // Auto-incrementing product code
  category: { type: String }, // Product category
  subCategory: { type: String }, // Product sub-category
  type: { type: String }, // Product type
  subType: { type: String }, // Product sub-type
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // Reference to the Brand schema
  price: { type: Number }, // Product price
  quantity: { type: Number }, // Available quantity
  about: { type: String }, // Description of the product
  technicalDetails: technicalDetailsSchema, // Technical details
  manufactureDetails: manufactureDetailsSchema, // Manufacture details
  warrantyAndCertifications: warrantyAndCertificationsSchema, // Warranty and certifications
  images: [productImagesSchema], // Array of images
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }, // Automatically set the update date            
}, { timestamps: true });


// Pre-save middleware to auto-generate an incremented product code
productSchema.pre('save', async function (next) {
  if (!this.code) {
    try {
      // Find the last saved product and get its code
      const lastProduct = await mongoose.model('Product').findOne().sort({ createdAt: -1 });

      // If a previous product exists, increment its code by 1; otherwise, start with 10000
      const lastCode = lastProduct ? parseInt(lastProduct.code, 10) : 9999;

      // Increment the last code by 1 and pad it to 5 digits
      this.code = (lastCode + 1).toString().padStart(5, '0');

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

export default Product;
