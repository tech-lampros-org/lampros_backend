import mongoose from 'mongoose';
import { nanoid } from 'nanoid'; // For generating unique IDs

const advancedUserSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true }, // Custom unique ID field
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'other'] },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
  },
  companyDetails: {
    companyName: { type: String },
    companyAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String },
    },
    companyEmail: { type: String },
    companyPhone: { type: String },
    companyGstNumber: { type: String },
  },
  plan: { type: String },
  role: { type: String },
  type: { type: String },
  duration: { type: String },
  place: { type: String },
  premium: {
    isPremium: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'elite'],
      default: 'basic',
    },
  },
  extraRoleFields: {
    professionalSpecificField: { type: String },
    affiliateSpecificField: { type: String },
  }
});

// Pre-save hook to generate a unique customId
advancedUserSchema.pre('save', async function(next) {
  if (!this.customId) {
    // Prefix for ID
    const prefix = 'ADV-';
    // Generate a unique ID
    const uniqueId = nanoid(10); // Generates a unique string of length 10
    this.customId = `${prefix}${uniqueId}`;
  }
  
  // Determine if the user is premium based on the plan
  if (this.plan === 'Premium') {
    this.premium.isPremium = true;
    this.premium.category = 'premium';
  } else {
    this.premium.isPremium = false;
    this.premium.category = 'basic'; // or any default value
  }
  
  next();
});

const AdvancedUser = mongoose.model('AdvancedUser', advancedUserSchema);

export default AdvancedUser;
