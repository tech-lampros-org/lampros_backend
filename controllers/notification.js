// notification.js
import 'dotenv/config'; 
import admin from 'firebase-admin';
import Notification from '../models/notification.js'; // Import Notification model



const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
