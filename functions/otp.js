import User from '../models/user.js';
import Otp from '../models/otp.js';
import { sendSmsvia2fact } from '../services/smsService.js'

// Function to create an OTP request
export const createOtpRequest = async (phoneNumber) => {
  // Check for existing OTP records for the phone number
  // const existingOtpRecord = await Otp.findOne({ phoneNumber, isVerified: false });
  // if (existingOtpRecord) {
  //   // Check if the existing OTP is still valid
  //   if (Date.now() <= existingOtpRecord.expiresAt) {
  //     throw new Error('An OTP has already been sent to this phone number.');
  //   } else {
  //     // If the existing OTP has expired, delete it
  //     await Otp.deleteMany({
  //       phoneNumber,
  //       expiresAt: { $lt: Date.now() }
  //     });
  //   }
  // }

  await Otp.deleteMany({
          phoneNumber,
          expiresAt: { $lt: Date.now() }
        });

  const otp = new Otp({ phoneNumber });
  otp.generateOtp();
  await otp.save();
  await sendSmsvia2fact(phoneNumber, otp.otp);
  return { message: 'OTP sent successfully.' };
};

// Function to verify OTP and log in a user, with registration if no details found
export const verifyOtpAndLogin = async (phoneNumber, otp) => {
  // Find the latest OTP record for the phone number and OTP
  const otpRecord = await Otp.findOne({ phoneNumber, otp }).sort({ createdAt: -1 });

  if (!otpRecord) throw new Error('Invalid OTP.');
  if (Date.now() > otpRecord.expiresAt) throw new Error('OTP has expired.');

  otpRecord.isVerified = true;
  await otpRecord.save();

  let user = await User.findOne({ phoneNumber });

  if (!user) {
    // Create a new user if none exists
    user = new User({ phoneNumber });
    await user.save();
    return { message: 'User created, please complete registration.' };
  }

  // Check if essential details are present
  const isCompleteProfile = user.fname && user.email;

  if (!isCompleteProfile) {
    return { message: 'User exists, but registration incomplete. Please complete your details.' };
  }

  return { message: 'User logged in successfully.' };
};


// Function to update user details after OTP verification
export const updateUserDetails = async (phoneNumber, updateFields) => {
  // Check if OTP is verified
  const otpRecord = await Otp.findOne({ phoneNumber });
  if (!otpRecord?.isVerified) throw new Error('OTP not verified.');

  // Find the user
  const user = await User.findOne({ phoneNumber });
  if (!user) throw new Error('User not found.');

  // Update the user details with the provided fields
  Object.assign(user, updateFields);

  await user.save();

  return { message: 'User details updated successfully.' };
};
