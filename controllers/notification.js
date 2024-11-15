import 'dotenv/config';
import admin from 'firebase-admin';
import Notification from '../models/notification.js'; // Import Notification model
import fetch from 'node-fetch'; // You may need to install node-fetch

// Fetch the service account JSON from the remote URL
const fetchServiceAccount = async () => {
  try {
    const response = await fetch('https://lamprosapp.github.io/farebase-test/');
    const serviceAccountJson = await response.json(); // Parse the JSON response
    return serviceAccountJson;
  } catch (error) {
    console.error('Error fetching service account JSON:', error);
    throw new Error('Failed to fetch service account');
  }
};

const initializeFirebase = async () => {
  const serviceAccount = await fetchServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase initialized successfully');
};

initializeFirebase(); // Call the initialization function

// Send notification to a specific device and save it in DB
export const sendNotificationToDevice = async (token, title, body, userId) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    // Send the message to the device
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
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
};

// Send notification to multiple devices and save it in the DB
export const sendNotificationToMultipleDevices = async (tokens, title, body, userIds) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    // Send the message to multiple devices
    const response = await admin.messaging().sendMulticast(message);

    // Save each notification in the database for each user
    for (let i = 0; i < tokens.length; i++) {
      const notification = new Notification({
        userId: userIds[i],  // Each user gets the corresponding token
        title,
        body,
        token: tokens[i],
      });
      await notification.save();
    }

    console.log('Notifications sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw new Error('Failed to send notifications');
  }
};

// Send notification to a topic and save it in DB
export const sendNotificationToTopic = async (topic, title, body, userId) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      topic,
    };

    // Send the message to a topic
    const response = await admin.messaging().send(message);

    // Save the notification in the database
    const notification = new Notification({
      userId,
      title,
      body,
      token: topic, // Topic as token
    });
    await notification.save();

    console.log('Notification sent to topic successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    throw new Error('Failed to send notification to topic');
  }
};
