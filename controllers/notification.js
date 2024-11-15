import admin from 'firebase-admin';
import Notification from '../models/notification.js';

// Fetch the service account JSON from the repository
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

// Initialize Firebase with fetched service account
const initializeFirebase = async () => {
  const serviceAccount = await fetchServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });

  console.log('Firebase initialized successfully');
};

// Call the initialization function
initializeFirebase();

// Function to send a notification to a single device and save it in the database
export const sendNotificationToDevice = async (token, title, body, userId) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    // Send the notification to the device
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

// Function to send notifications to multiple devices and save each in the database
export const sendNotificationToMultipleDevices = async (tokens, title, body, userIds) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    // Send the notification to multiple devices
    const response = await admin.messaging().sendMulticast(message);

    // Save each notification in the database for each user
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
    console.error('Error sending notifications:', error);
    throw new Error('Failed to send notifications');
  }
};

// Function to send a notification to a topic and save it in the database
export const sendNotificationToTopic = async (topic, title, body, userId) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      topic,
    };

    // Send the notification to the topic
    const response = await admin.messaging().send(message);

    // Save the notification in the database
    const notification = new Notification({
      userId,
      title,
      body,
      token: topic, // Topic used as the token identifier
    });
    await notification.save();

    console.log('Notification sent to topic successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    throw new Error('Failed to send notification to topic');
  }
};
