import Otp from '../models/otpModel.js';
import AdvancedUser from '../models/advancedUserModel.js';
import Homeowner from '../models/homeownerModel.js';
import { sendSms } from '../services/smsService.js';
import { generateToken } from '../config/jwtConfig.js';
import { logger } from '../config/loggingConfig.js';

// Request OTP
export const requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Invalidate existing OTPs for this phone number
    await Otp.updateMany({ phoneNumber, isVerified: false }, { $set: { isVerified: true } });

    // Generate new OTP
    const otpRecord = new Otp({ phoneNumber });
    otpRecord.generateOtp();
    await otpRecord.save();

    // Send OTP SMS (Uncomment when SMS service is available)
    // await sendSms(phoneNumber, `Your OTP code is ${otpRecord.otp}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

// Verify OTP and handle registration or login
export const verifyOtp = async (req, res) => {
  const { phoneNumber, otp, userType, firstName, lastName, ...userData } = req.body;

  try {
    // Check OTP validity
    const otpRecord = await Otp.findOne({ phoneNumber, otp, isVerified: false });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let user;
    // Default to 'homeowner' if userType is not specified
    const isAdvancedUser = userType === 'advanced';
    const isHomeowner = userType === 'homeowner' || !userType;

    if (isAdvancedUser) {
      user = await AdvancedUser.findOne({ phoneNumber });
      if (!user) {
        // Create new AdvancedUser if not exists
        if (!userData.password || !userData.email) {
          return res.status(400).json({ message: 'Password and email are required for new registration' });
        }
        user = new AdvancedUser({ ...userData, phoneNumber });
        await user.save();
      }
    } else if (isHomeowner) {
      user = await Homeowner.findOne({ phoneNumber });
      if (!user) {
        // Create new Homeowner if not exists
        if (!firstName || !lastName) {
          return res.status(400).json({ message: 'First name and last name are required for new registration' });
        }
        user = new Homeowner({ phoneNumber, name: `${firstName} ${lastName}` });
        await user.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Generate token for authenticated user
    const token = generateToken(user.customId);
    otpRecord.isVerified = true;
    await otpRecord.save();

    res.status(user ? 200 : 201).json({
      message: user ? 'Login successful' : 'Registration successful',
      user,
      token
    });
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
};
