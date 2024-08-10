import AdvancedUser from '../models/advancedUserModel.js';
// import { updateSheet } from '../services/sheetsService.js';

export const createAdvancedUser = async (req, res) => {
  const {
    password,
    email,
    phoneNumber,
    name,
    age,
    gender,
    companyName,
    company_address,
    company_city,
    company_email,
    company_phone,
    company_gstNumber,
    company_pincode,
    duration,
    plan,
    role,
    type,
    place
  } = req.body;

  const isPremium = plan === 'Premium';

  // Prepare user data
  const userData = {
    password,
    email,
    phoneNumber,
    name,
    age,
    gender,
    address: {
      street: company_address,
      city: company_city,
      state: null,
      country: null,
      pincode: company_pincode,
    },
    companyDetails: {
      companyName,
      companyAddress: {
        street: company_address,
        city: company_city,
        state: null,
        country: null,
        pincode: company_pincode,
      },
      companyEmail: company_email,
      companyPhone: company_phone,
      companyGstNumber: company_gstNumber,
    },
    plan,
    role,
    type,
    duration,
    place,
    premium: {
      isPremium,
      category: isPremium ? 'premium' : 'basic'
    }
  };

  try {
    // // Update Google Sheets first
    // await updateSheet({
    //   age,
    //   companyName,
    //   company_address,
    //   company_city,
    //   company_email,
    //   company_phone,
    //   company_gstNumber,
    //   company_pincode,
    //   duration,
    //   email,
    //   gender,
    //   name,
    //   phoneNumber,
    //   place,
    //   plan,
    //   role,
    //   type
    // });

    // Update MongoDB
    const advancedUser = new AdvancedUser(userData);
    await advancedUser.save();

    // Send the response
    res.status(201).json(advancedUser);
  } catch (error) {
    // Handle the error
    console.error('Error updating data:', error);

    // Optionally, you could try to undo the Google Sheets update here, 
    // but it's complex and often not feasible due to the lack of transactions.

    // Send error response
    res.status(400).json({ message: error.message });
  }
};
