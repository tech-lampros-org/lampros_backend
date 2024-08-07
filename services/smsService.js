import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendSms = (to, message) => {
  return new Promise((resolve, reject) => {
    vonage.messages.sendSms(process.env.VONAGE_PHONE_NUMBER, to, message, (err, responseData) => {
      if (err) {
        reject(err);
      } else {
        resolve(responseData);
      }
    });
  });
};
