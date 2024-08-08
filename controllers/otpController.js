import Otp from '../models/otpModel.js';
import Homeowner from '../models/homeownerModel.js';
import { sendSms } from '../services/smsService.js';
import { generateToken } from '../config/jwtConfig.js'; 
import {logger} from '../config/loggingConfig.js';

// Step 1: Request OTP
export const requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  // Invalidate any existing OTPs for this phone number
  await Otp.updateMany({ phoneNumber, isVerified: false }, { $set: { isVerified: true } });

  // Generate new OTP
  const otpRecord = new Otp({ phoneNumber });
  otpRecord.generateOtp();
  await otpRecord.save();

  // Send OTP SMS
  try {
    // await sendSms(phoneNumber, `Your OTP code is ${otpRecord.otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

// Step 2: Verify OTP and handle registration or login
export const verifyOtp = async (req, res) => {
  const { phoneNumber, otp, firstName, lastName } = req.body;

  const otpRecord = await Otp.findOne({ phoneNumber, otp, isVerified: false });
  if (!otpRecord || otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // OTP is valid, but do not mark as verified yet
  // Check if homeowner exists
  let homeowner = await Homeowner.findOne({ phoneNumber });
  if (!homeowner) {
    // Create new homeowner if not exists
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required for new registration' });
    }
    homeowner = new Homeowner({ phoneNumber, name: `${firstName} ${lastName}` });
    await homeowner.save();
    const token = generateToken(homeowner.customId); // Generate token with customId
    otpRecord.isVerified = true; // Mark OTP as verified only after successful registration
    await otpRecord.save();
    res.status(201).json({ message: 'Registration successful', homeowner, token });
  } else {
    const token = generateToken(homeowner.customId); // Generate token with customId
    otpRecord.isVerified = true; // Mark OTP as verified only after successful login
    await otpRecord.save();
    res.status(200).json({ message: 'Login successful', homeowner, token });
  }
};
