import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js'; // Adjust path as needed

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'lampros_profiles', // Folder in Cloudinary where images will be stored
    allowed_formats: ['jpg', 'png', 'gif']
  }
});

const upload = multer({ storage });

export default upload;
