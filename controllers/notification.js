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
      projectId: 'project-lampros',
      clientEmail: 'firebase-adminsdk-imvdg@project-lampros.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDX1Bp/kpPViiODd+YHsVQAE/KqauEzLFkRtT9WRZSS4cONFU0irGFvtoy6asBBnhniR7zxw5OXKdPdmHQcgJ0U4eD3r5B3+vO7N6BgWPKv/cedrrY/DrQPN8nznx7R+QmzY8sh8ELL9nk+r2rcj9QsYnP9wDEZw5eyLg/d07wmJTZJ9KPbFZuXCKmRMoFLpfeYfn3Sswz2ttEHnYNokNRXYbNiBAb0J0MHAi0ujdA9XM0qmCeXiEIJlR8v+YkzpEkHt3IlMFcveLe6O9G8INpoMHCcv/GGCqr14gBOlxE03aCv7Jpz/eOcSf/E+JewEDubJc5wmy3rEADwWL788F7dAgMBAAECggEAH1v31wNtgYBxyooNnUkxuFUtqX9Ku2G9Nf/MynSPsuEkxbILpCHB1+EsBMYQAI4VRWCWXoEZR8R8aTKGjxb3kUTZ/YMVOFROklbxxtiwYnaQSM6i4k9ORaEd3Hez8F8BVCmy0SU/agf6SUEPA38jx/3XdqOJ6YFsNX0l3F2wdSYnKxBK+Avfs2/02o4a/pITsDvTJmDyxIXhT/Rbp9Plfm2teBegoxc8yMmuAzp7ENjYQCeJ/Yh4Iif6zV5TGI6iNtMWl8hW7WiLH7YTMHiA5Y8xvvDzdbjvJ/bHgwkwLYyWxowxX8CnHe2zftF7oPcwAP24eJ8uec+u018wxEV8jQKBgQD9+0+Bzy89q5nLN4FvgPi1f+KlOSfSMPG0dUX+EjKGTL4W8N/Gocl3b55at5SvQNoNlveBAO4ER99qDqtCc+2GRWS7bJ3aJzIaEZ1J71d4zVVDjtl1mSB/VUI7t5iHsk2fJDjN3aPpZOla8N7jeRG6jDo8iCd0emY2O+CgFPjeswKBgQDZiy0BM+z4ILoJrs7cPPo2LZdtQToLXz5D2panxWBNtdCgfV8N4G9F+fPmVajMzaCNIg56RbRj/LDMPbpWljrd5Auu+1hokkAq0hG9ol8m7I4AUwlgvtDSaRwqhYlexXBNBhkMC1wPWX1MyW2PxAiPRCiDTPs1gHLuVX7484CULwKBgQD2X9ESpT64XjxES8W9uqiIuFPN3xHn7h6p5ZFOE6z7ZnqHmoYZE1xyBc7hRXBwSUK9KBNUCujZMjdhlHVBc1+Yfrxmq8i8lIUfkLK5w/lgcB8j9/CvCSnjG3uynjjSeX6ev+5ylWypvYA4/avZkdpG0jyz94f+j7WTKqaN44o/zQKBgAyvzyoYyyMVVYQnC61QaQ8rzX7zpNzw6wKuBsc1/Y3KoqYZaae3hQXBs/Wk3TlEbK6OY+XBlumV3QGsP+e4zyoNmJjV06wVi2Rz59D1XTM57HYcYZmgxzDeLGRWcVJzlT8IsgE/0Fic0W/e92LA/fbM9Mfjf2r5WLqJheQi30bFAoGAELX0j5lAyB7UHUWSnCeVpPR1sR/37gZyeAX2ItVsvTs+luypsL8AIowp+zLBzKgnaCphhcwh1oNV3Vjg51WK4g3kv/kxHPLNFgY5bAvBmmom0n2T8Hn75y8quy07Xd6biM/tAIJsO6AZ0Gn/VKrNRlVJITlaPawPJr8BCcWtpIE=-----END PRIVATE KEY-----',
    }),
  });

  console.log('Firebase initialized successfully');
};

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

export const sendTestNotification = async () => {
  const testToken = "f45lt74FQR6-Zoz8mXHQka:APA91bFGSG-9U9PumFaEY89xzcvL7d7NiTobM_Jh7occVkg80d3fMXCn_WeQ6V8_pBiLdzDLigGr557k_u8IFN7Pgr4LCjQS_lir7gc_8MGBPMZZuhnuFdA";
  const title = "Test Notification from nishmal";
  const body = "This is a test notification to verify Firebase setup.";

  try {
    const message = {
      notification: {
        title,
        body,
      },
      token: testToken,
    };

    // Send the test notification to the device
    const response = await admin.messaging().send(message);

    console.log("Test notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending test notification:", error);
    throw new Error("Failed to send test notification");
  }
};

// Initialize Firebase and then send the test notification
initializeFirebase()
  .then(() => {
    return sendTestNotification();
  })
  .then((response) => {
    console.log("Notification Response:", response);
  })
  .catch((error) => {
    console.error("Notification Error:", error.message);
  });
