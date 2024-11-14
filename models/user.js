import mongoose from 'mongoose';
import { nanoid } from 'nanoid'; // For generating unique IDs

// Delivery Address Schema
const deliveryAddressSchema = new mongoose.Schema({
  fullName: { type: String },
  mobile: { type: String },
  altMobile: { type: String }, // Optional alternate mobile number
  pincode: { type: Number },
  district: { type: String },
  city: { type: String },
  address: { type: String},
  landmark: { type: String }, // Optional landmark for delivery address
}, { timestamps: true });

// Schema for personal address
const addressSchema = new mongoose.Schema({
  place: { type: String },
  pincode: { type: Number }, // pincode as Number
});

// Schema for company address without street and area fields
const companyAddressSchema = new mongoose.Schema({
  place: { type: String },
  pincode: { type: Number }, // pincode as Number
});

const companyDetailsSchema = new mongoose.Schema({
  companyName: { type: String },
  companyAddress: companyAddressSchema, // Using the updated company address schema
  companyEmail: { type: String },
  isCompanyEmailVerified: { type: Boolean, default: false }, // New field for company email verification
  companyPhone: { type: String },
  companyGstNumber: { type: String },
  experience: { type: Number , default: 0 }, // Experience in years
});

const UserSchema = new mongoose.Schema(
  {
    customId: { type: String }, // Custom unique ID field
    password: { type: String },
    email: { type: String },
    isVerified: { type: Boolean, default: false }, // New isVerified field for email verification
    phoneNumber: { type: String, required: true, unique: true },
    fname: { type: String }, // First name
    lname: { type: String }, // Last name
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'non-binary', 'Other'] },
    profileImage: { type: String }, // New profileImage field for storing image URL
    address: addressSchema, // Use the personal address schema here
    companyDetails: companyDetailsSchema, // Use the company details schema with updated address structure
    role: { type: String, enum: ['Realtor', 'Product Seller', 'Professionals', 'Home Owner'], default: 'Home Owner' },
    type: { type: String },
    token: { type : String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    premium: {
      isPremium: { type: Boolean, default: false },
      category: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'elite'],
        default: 'basic',
      },
      duration: { type: String, default: '6 Months' }, // Set default duration to 'basic'
    },
    extraRoleFields: {
      professionalSpecificField: { type: String },
      affiliateSpecificField: { type: String },
    },
    deliveryAddresses: [deliveryAddressSchema],
  },
  { timestamps: true } // Enable timestamps here
);

// Pre-save hook to generate a unique customId
UserSchema.pre('save', async function (next) {
  const prefix = `${this.role || 'USER'}-`;
  const uniqueId = nanoid(10); // Generates a unique string of length 10
  this.customId = `${prefix}${uniqueId}`;

  next();
});

const User = mongoose.model('User', UserSchema);

export default User;
