import { createOtpRequest, validateOtp, updateUserDetails, loginWithOtp } from '../functions/otp.js';
import { generateToken, verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

export const requestOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const response = await createOtpRequest(phoneNumber);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const response = await validateOtp(phoneNumber, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    const { phoneNumber, name, age, otherDetails } = req.body;
    const response = await updateUserDetails(phoneNumber, name, age, otherDetails);
    
    // Generate JWT token after successful registration
    const token = generateToken(response.userId);

    res.status(200).json({ message: 'Registration complete', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const response = await loginWithOtp(phoneNumber, otp);
    
    // Generate JWT token
    const token = generateToken(response.userId);

    res.status(200).json({ message: response.message, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Get the user ID from the request (set by the protect middleware)
    const userId = req.user;

    // Fetch the user profile from the database
    const user = await User.findById(userId).select('-password -__v'); // Exclude password and other unnecessary fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
