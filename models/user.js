import mongoose from 'mongoose';
import { nanoid } from 'nanoid'; // For generating unique IDs

// Schema for personal address
const addressSchema = new mongoose.Schema({
  street: { type: String },
  thaluk: { type: String },
  district: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: Number }, // pincode as Number
});

// Schema for company address without street and area fields
const companyAddressSchema = new mongoose.Schema({
  buildingName: { type: String },  // Example field specific to company address
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: Number },      // pincode as Number
});

const companyDetailsSchema = new mongoose.Schema({
  companyName: { type: String },
  companyAddress: companyAddressSchema, // Using the updated company address schema
  companyEmail: { type: String },
  isCompanyEmailVerified: { type: Boolean, default: false }, // New field for company email verification
  companyPhone: { type: String },
  companyGstNumber: { type: String },
});

const UserSchema = new mongoose.Schema({
  customId: { type: String }, // Custom unique ID field
  password: { type: String },
  email: { type: String },
  isVerified: { type: Boolean, default: false }, // New isVerified field for email verification
  phoneNumber: { type: String, required: true, unique: true },
  f_name: { type: String }, // First name
  l_name: { type: String }, // Last name
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'non-binary', 'Other'] },
  profileImage: { type: String }, // New profileImage field for storing image URL
  address: addressSchema,        // Use the personal address schema here
  companyDetails: companyDetailsSchema, // Use the company details schema with updated address structure
  role: { type: String },
  type: { type: String },
  premium: {
    isPremium: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'elite'],
      default: 'basic',
    },
    duration: { type: String, default: 'basic' }, // Set default duration to 'basic'
  },
  extraRoleFields: {
    professionalSpecificField: { type: String },
    affiliateSpecificField: { type: String },
  },
});

// Pre-save hook to generate a unique customId
UserSchema.pre('save', async function(next) {
  const prefix = `${this.role || 'USER'}-`;
  const uniqueId = nanoid(10); // Generates a unique string of length 10
  this.customId = `${prefix}${uniqueId}`;

  // Determine if the user is premium based on the plan
  if (this.plan === 'Premium') {
    this.premium.isPremium = true;
    this.premium.category = 'premium';
    this.premium.duration = 'premium'; // Set duration to 'premium'
  } else {
    this.premium.isPremium = false;
    this.premium.category = 'basic';
    this.premium.duration = 'basic'; // Set default duration to 'basic'
  }

  next();
});

const User = mongoose.model('User', UserSchema);

export default User;
