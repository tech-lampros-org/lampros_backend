import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },

  bhkCount: {
    type: String
  },

  areaSqFt: {
    type: String
  },

  budgetINR: {
    type: String
  },

  lookingFor: {
    type: String
  },
  
  serviceLookingFor: [ {
    type: String
  }],
  

  timelineMonths: {
    type: String
  },

  pincode: {
    type: String,
    required: true
  },

  interested: {
    type: String
  },

  moreDetails: {
    type: String,
    default: ''
  },

  scopes: [
    {
      type: String
    }
  ],

  quantity: {
    type: String
  },

  doorsType: [
    {
      type: String
    }
  ],

  materials: [
    {
      type: String
    }
  ],

  planToBuyInMonths: {
    type: String
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
