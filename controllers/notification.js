import admin from 'firebase-admin';
import dotenv from 'dotenv';
import Notification from '../models/notification.js'; // Import your Mongoose model

// Load environment variables
dotenv.config();

// Initialize Firebase
const initializeFirebase = () => {
  try {
    console.log("here")
      admin.initializeApp({
        credential: admin.credential.cert({
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI,
          token_uri: process.env.FIREBASE_TOKEN_URI,
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        }),
      });
      console.log('Firebase initialized successfully');
    
  } catch (error) {
    console.error('Error initializing Firebase:', error.message);
    throw new Error('Failed to initialize Firebase. Please check your credentials and environment variables.');
  }
};

// Send notification to a single device
export const sendNotificationToDevice = async (token, title, body, userId) => {
  try {
    initializeFirebase();

    const message = {
      notification: { title, body },
      token,
    };

    const response = await admin.messaging().send(message);

    // Save the notification in the database
    const notification = new Notification({
      userId,
      title,
      body,
      token,
    });
    await notification.save();

    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw new Error('Failed to send notification');
  }
};

// Send notification to multiple devices
export const sendNotificationToMultipleDevices = async (tokens, title, body, userIds) => {
  try {
    initializeFirebase();

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    for (let i = 0; i < tokens.length; i++) {
      const notification = new Notification({
        userId: userIds[i],
        title,
        body,
        token: tokens[i],
      });
      await notification.save();
    }

    console.log('Notifications sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notifications:', error.message);
    throw new Error('Failed to send notifications');
  }
};

// Send test notification
export const sendTestNotification = async () => {
  const testToken = 'fLoRJllsR6-CPasZwb_eVK:APA91bGGAAaBs69dD_MTDslmwKBQ9NGc3DQwQepmhohaHdtuZSt4IeRpszOr35nTLNRBF40lBdhcK8XF5g4GG-_IcmNNE2wYmwghqQr_9ix01M-f1gUQ1iI'; // Replace with a valid FCM token
  const title = 'Test Notification from backend';
  const body = 'This is a test notification to verify Firebase setup.';

  try {
    initializeFirebase();

    const message = {
      notification: { title, body },
      token: testToken,
    };

    const response = await admin.messaging().send(message);

    console.log('Test notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending test notification:', error.message);
    throw new Error('Failed to send test notification');
  }
};

(async () => {
  try {
    const response = await sendTestNotification();
    console.log('Notification Response:', response);
  } catch (error) {
    console.error('Error sending test notification:', error.message);
  }
})();