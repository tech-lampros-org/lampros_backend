import mongoose from 'mongoose';

const homeownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // Other homeowner fields...
});

const Homeowner = mongoose.model('Homeowner', homeownerSchema);

export default Homeowner;
