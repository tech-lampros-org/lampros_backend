import { createOtpRequest, verifyOtpAndLogin, updateUserDetails } from '../functions/otp.js';
import { generateToken, verifyToken } from '../config/jwt.js';
import User from '../models/user.js';
import ProProject from '../models/pro-projects.js';
import Product from '../models/pro-products.js';
import Brand from '../models/brand.js';
import Category from '../models/catogory.js';
import { sendSmsvia2fact } from '../services/smsService.js';

export const requestOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const response = await createOtpRequest(phoneNumber);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
      // Delete the user document
      await User.findByIdAndDelete(userId)

      // Delete all ProProjects created by the user
      await ProProject.deleteMany({ createdBy: userId })
  
      // Delete all Products created by the user
      await Product.deleteMany({ createdBy: userId })
  

    res.status(200).json({  message: 'Account and all associated data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account. Please try again later.' });
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

    await sendSmsvia2fact(phoneNumber,`*Welcome to Lampros!*

    Thank you for joining the Lampros family. You’re now one step closer to bringing your dream home to life! Explore a wide range of home designs, top-quality products, expert consultations, and connect with trusted professionals—all in one place.
    
    Feel free to start exploring the app, and if you have any questions or need assistance, we’re here to help.
    
    Welcome aboard, and happy homebuilding!
    
    *Team Lampros*
    India’s First Virtual Buildmart`)

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

    console.log(req)

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        url: req.file
      }
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message });
  }
};


export const uploadImages = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Log the entire request for debugging
    console.log(req);

    // Prepare an array of uploaded file URLs
    const uploadedFiles = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      filename: file.filename // Cloudinary filename
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


export const filterUsersWithProjectsOrProducts = async (req, res) => {
  try {
    const { role, type } = req.query; // Extract role and type from query parameters

    // Build a filter object for MongoDB
    const filter = {};

    let roleArray = [];
    let typeArray = [];
    if (role) {
      roleArray = role.split(','); // Split by comma for multiple roles
      filter.role = { $in: roleArray }; // Use $in to filter by multiple roles
    }

    if (type) {
      const typeArray = type.split(','); // Split by comma for multiple types
      filter.type = { $in: typeArray }; // Use $in to filter by multiple types
    }

    // Find users based on the role and type
    let users = await User.find(filter).select('-password -__v'); // Exclude password and other unnecessary fields

    // Prepare an array to store users with their projects/products
    const usersWithProjectsOrProducts = [];

    for (const user of users) {
      let userWithDetails = user.toObject(); // Convert Mongoose doc to plain object

      // Depending on the role, fetch related projects or products
      if (roleArray.includes('Realtor') || roleArray.includes('Professionals')) {
        // Fetch ProProjects where createdBy matches the user's _id
        const projects = await ProProject.find({ createdBy: user._id });
        userWithDetails.projects = projects; // Add projects to the user object
      } else if (roleArray.includes('Product Seller')) {
        // Fetch Products where createdBy matches the user's _id
        const products = await Product.find({ createdBy: user._id });
        userWithDetails.products = products; // Add products to the user object
      }

      usersWithProjectsOrProducts.push(userWithDetails); // Add user with projects/products to the result array
    }

    if (usersWithProjectsOrProducts.length === 0) {
      return res.status(200).json([]);
    }

    // Return the filtered users with their projects/products
    res.status(200).json(usersWithProjectsOrProducts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
