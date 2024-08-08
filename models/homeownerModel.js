import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const homeownerSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  name: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // Other homeowner fields...
});

// Pre-save hook to generate a unique customId
homeownerSchema.pre('save', async function(next) {
    // Prefix for ID
    const prefix = 'ADV-';
    // Generate a unique ID
    const uniqueId = nanoid(10); // Generates a unique string of length 10
    this.customId = `${prefix}${uniqueId}`;
  next();
});

const Homeowner = mongoose.model('Homeowner', homeownerSchema);

export default Homeowner;
