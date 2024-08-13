import User from '../models/user.js';
import Otp from '../models/otp.js';

// Function to create an OTP request
export const createOtpRequest = async (phoneNumber) => {
  // Check for existing OTP records for the phone number
  const existingOtpRecord = await Otp.findOne({ phoneNumber, isVerified: false });
  if (existingOtpRecord) {
    // Check if the existing OTP is still valid
    if (Date.now() <= existingOtpRecord.expiresAt) {
      throw new Error('An OTP has already been sent to this phone number.');
    } else {
      // If the existing OTP has expired, delete it
      await Otp.deleteMany({
        phoneNumber,
        expiresAt: { $lt: Date.now() }
      });
    }
  }

  const otp = new Otp({ phoneNumber });
  otp.generateOtp();
  await otp.save();
  return { message: 'OTP sent successfully.' };
};

// Function to validate OTP
export const validateOtp = async (phoneNumber, otp) => {
  

  // Find the OTP record for the phone number and OTP
  const otpRecord = await Otp.findOne({ phoneNumber, otp });
  
  if (!otpRecord) throw new Error('Invalid OTP.');
  if (Date.now() > otpRecord.expiresAt) throw new Error('OTP has expired.');

  otpRecord.isVerified = true;
  await otpRecord.save();

  return { message: 'OTP verified successfully.' };
};



// Function to update user details after OTP verification
export const updateUserDetails = async (phoneNumber, name, age, otherDetails) => {
  const otpRecord = await Otp.findOne({ phoneNumber });
  if (!otpRecord?.isVerified) throw new Error('OTP not verified.');

  const user = await User.findOne({ phoneNumber });
  if (!user) throw new Error('User not found.');

  Object.assign(user, { name, age, ...otherDetails });
  await user.save();

  return { message: 'User details updated successfully.' };
};

// Function to log in a user using OTP, with registration if no details found
export const loginWithOtp = async (phoneNumber, otp) => {
  await validateOtp(phoneNumber, otp);
  let user = await User.findOne({ phoneNumber });

  if (!user) {
    // Create a new user if none exists
    user = new User({ phoneNumber });
    await user.save();
    return { message: 'User created, please complete registration.' };
  }

  // Check if essential details are present
  const isCompleteProfile = user.name && user.email && user.password;

  if (!isCompleteProfile) {
    return { message: 'User exists, but registration incomplete. Please complete your details.' };
  }

  return { message: 'User logged in successfully.' };
};
