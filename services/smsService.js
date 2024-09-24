import { Vonage } from '@vonage/server-sdk';
import {logger} from '../config/loggingConfig.js';
import fetch from 'node-fetch';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendSmsvia2fact = (to, message, next) => {
  return new Promise((resolve, reject) => {
    vonage.sms.send({ to, from: process.env.VONAGE_PHONE_NUMBER, text: message }, (err, responseData) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        if (responseData.messages[0].status === "0") {
          resolve(responseData);
          if (typeof next === 'function') next(); // Call next if it's a function
        } else {
          reject(new Error(responseData.messages[0]['error-text']));
        }
      }
    });
  });
};

// export const sendSmsvia2fact = async (phoneNumber, otp) => {
//   const apiKey = process.env.TWO_FACTOR_SMS_API_KEY; // Your 2Factor API key
//   const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}`;

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to send OTP: ${response.statusText}`);
//     }

//     const data = await response.json();

//     if (data.Status === 'Success') {
//       logger.info(`OTP sent successfully to ${phoneNumber}`);
//       return data;
//     } else {
//       throw new Error(`Error from 2Factor: ${data.Details}`);
//     }
//   } catch (error) {
//     logger.error(`Error sending OTP: ${error.message}`);
//     throw error;
//   }
// };

