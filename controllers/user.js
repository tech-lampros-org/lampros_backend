import { createOtpRequest, verifyOtpAndLogin, updateUserDetails } from '../functions/otp.js';
import { generateToken, verifyToken } from '../config/jwt.js';
import User from '../models/user.js';

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
    const response = await verifyOtpAndLogin(phoneNumber, otp);
    
    // Generate JWT token
    const user = await User.findOne({ phoneNumber });
    const token = generateToken(user._id);

    res.status(200).json({ message: response.message, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const completeBasic = async (req, res) => {
  try {
    const { phoneNumber, f_name, l_name, profileImage, role } = req.body;

    // Update user details
    const response = await updateUserDetails(phoneNumber, { f_name, l_name, profileImage, role });

    // Fetch the updated user to generate the token
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = generateToken(user._id);

    res.status(200).json({ message: 'Registration complete', token });
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

export const uploadImage = async (req, res) => {
  try {
    // Handle image upload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.originalname,
        url: req.file.secure_url
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

