import { Vonage } from '@vonage/server-sdk';
import logger from '../config/loggingConfig.js';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendSms = (to, message) => {
  return new Promise((resolve, reject) => {
    vonage.sms.send({ to, from: process.env.VONAGE_PHONE_NUMBER, text: message }, (err, responseData) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        if (responseData.messages[0].status === "0") {
          resolve(responseData);
        } else {
          reject(new Error(responseData.messages[0]['error-text']));
        }
      }
    });
  });
};
