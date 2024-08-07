import Otp from '../models/otpModel.js';
import Homeowner from '../models/homeownerModel.js';
import { sendSms } from '../services/smsService.js';

// Step 1: Request OTP
export const requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  let otpRecord = await Otp.findOne({ phoneNumber });
  if (otpRecord && !otpRecord.isVerified && otpRecord.expiresAt > Date.now()) {
    return res.status(200).json({ message: 'OTP already sent' });
  }

  // Generate new OTP
  otpRecord = new Otp({ phoneNumber });
  otpRecord.generateOtp();
  await otpRecord.save();

  // Send OTP SMS
  try {
    await sendSms(phoneNumber, `Your OTP code is ${otpRecord.otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

// Step 2: Verify OTP and handle registration or login
export const verifyOtp = async (req, res) => {
  const { phoneNumber, otp, firstName, lastName } = req.body;

  const otpRecord = await Otp.findOne({ phoneNumber, otp });
  if (!otpRecord || otpRecord.expiresAt < Date.now() || otpRecord.isVerified) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // OTP is valid
  otpRecord.isVerified = true;
  await otpRecord.save();

  // Check if homeowner exists
  let homeowner = await Homeowner.findOne({ phoneNumber });
  if (!homeowner) {
    // Create new homeowner if not exists
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required for new registration' });
    }
    homeowner = new Homeowner({ phoneNumber, name: `${firstName} ${lastName}` });
    await homeowner.save();
    res.status(201).json({ message: 'Registration successful', homeowner });
  } else {
    // Optionally update the homeowner's name if it was provided
    if (firstName || lastName) {
      homeowner.name = `${firstName || ''} ${lastName || ''}`;
      await homeowner.save();
    }
    res.status(200).json({ message: 'Login successful', homeowner });
  }
};
