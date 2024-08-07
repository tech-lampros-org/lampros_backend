// controllers/advancedUserController.js
import AdvancedUser from '../models/advancedUserModel.js';

export const createAdvancedUser = async (req, res) => {
  try {
    const { username, password, userType, email, phoneNumber, address, businessDetails } = req.body;
    
    // Create a new AdvancedUser instance
    const advancedUser = new AdvancedUser({
      username,
      password,
      userType,
      email,
      phoneNumber,
      address,
      businessDetails,
    });

    // Save the user to the database
    await advancedUser.save();
    
    // Send the response
    res.status(201).json(advancedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
