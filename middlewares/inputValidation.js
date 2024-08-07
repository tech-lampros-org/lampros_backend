// middlewares/inputValidation.js
import { body, validationResult } from 'express-validator';

// Validation rules
export const validateCreateAdvancedUser = [
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phoneNumber')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number format'),
  body('address.street').optional().isString(),
  body('address.city').optional().isString(),
  body('address.state').optional().isString(),
  body('address.country').optional().isString(),
  body('address.pincode').optional().isString(),
  body('businessDetails.companyName').optional().isString(),
  body('businessDetails.companyAddress.street').optional().isString(),
  body('businessDetails.companyAddress.city').optional().isString(),
  body('businessDetails.companyAddress.state').optional().isString(),
  body('businessDetails.companyAddress.country').optional().isString(),
  body('businessDetails.companyAddress.pincode').optional().isString(),
  body('gst').optional().isString(),
  body('age').optional().isNumeric().withMessage('Age must be a number'),
  body('gender').optional().isIn(['male', 'female', 'non-binary', 'other']).withMessage('Invalid gender value'),
  body('premium.isPremium').optional().isBoolean(),
  body('premium.category').optional().isIn(['basic', 'standard', 'premium', 'elite']).withMessage('Invalid premium category'),
  
  // Middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
