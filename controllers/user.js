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

export const completeRegistration = async (req, res) => {
  try {
    const { phoneNumber, fname, lname, profileImage, role, type, email, companyDetails, address } = req.body;

    const isNotEmpty = (value) => value !== undefined && value !== null && value !== '';

    // Array to track empty required fields
    const emptyFields = [];

    if (!isNotEmpty(fname)) emptyFields.push('fname');
    if (!isNotEmpty(lname)) emptyFields.push('lname');
    if (!isNotEmpty(role)) emptyFields.push('role');
    if (!isNotEmpty(type)) emptyFields.push('type');
    if (!isNotEmpty(email)) emptyFields.push('email');
    if (!isNotEmpty(address)) emptyFields.push('address');

    // If any required fields are empty, return an error response
    if (emptyFields.length > 0) {
      return res.status(400).json({
        message: 'The following required fields are empty:',
        emptyFields,
      });
    }

    // Proceed to build the updated fields object
    const updatedFields = {
      fname,
      lname,
      profileImage: isNotEmpty(profileImage)
        ? profileImage
        : 'https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg',
      role,
      type,
      email,
      ...(isNotEmpty(companyDetails) && { companyDetails }),
      ...(isNotEmpty(address) && { address }),
    };

    // Update user details
    const response = await updateUserDetails(phoneNumber, updatedFields);

    // Fetch the updated user to generate the token
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a token for the user
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
        url: req.file.secure_url
      }
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
};

