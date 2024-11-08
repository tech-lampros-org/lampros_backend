import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },

  bhkCount: {
    type: Number,
    
  },

  areaSqFt: {
    type: Number,
    
  },

  budgetINR: {
    min: { type: Number },
    max: { type: Number },
    
  },

  lookingFor: {
    type: String,
    
  },

  timelineMonths: {
    min: { type: Number },
    max: { type: Number },
    
  },

  pincode: {
    type: String,
    required: true
  },

  interested: {
    type: Boolean,
    
  },

  moreDetails: {
    type: String,
    default: ''
  },

  scopes: [
    {
      type: String,
      
    }
  ],

  quantity: {
    type: Number,
    
  },

  doorsType: [
    {
      type: String,
      
    }
  ],

  materials: [
    {
      type: String,
      
    }
  ],

  planToBuyInMonths: {
    min: { type: Number },
    max: { type: Number },
    
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
