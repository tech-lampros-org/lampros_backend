import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Set this in your environment variables
  api_key: process.env.CLOUDINARY_API_KEY,       // Set this in your environment variables
  api_secret: process.env.CLOUDINARY_API_SECRET  // Set this in your environment variables
});

export default cloudinary;
