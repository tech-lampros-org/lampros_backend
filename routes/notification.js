// routes/notificationRoutes.js
import express from 'express';
import { sendNotificationToDevice, sendNotificationToTopic, sendNotificationToMultipleDevices } from '../controllers/notification.js';
import Notification from '../models/notification.js'; // Import Notification model

const router = express.Router();

// Middleware to verify authentication and set `req.user`
import { protect as authenticateUser } from '../middlewares/protect.js';

// POST: Send a notification to a specific device
router.post('/sendToDevice', authenticateUser, async (req, res) => {
  const { token, title, body, userId } = req.body;

  try {
    const response = await sendNotificationToDevice(token, title, body, userId);
    res.status(200).json({ message: 'Notification sent', response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Send notification to multiple devices (multiple users)
router.post('/sendToMultipleDevices', authenticateUser, async (req, res) => {
  const { tokens, title, body, userIds } = req.body;

  if (tokens.length !== userIds.length) {
    return res.status(400).json({ message: 'Tokens and User IDs arrays must have the same length' });
  }

  try {
    const response = await sendNotificationToMultipleDevices(tokens, title, body, userIds);
    res.status(200).json({ message: 'Notifications sent', response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Send a notification to a topic
router.post('/sendToTopic', authenticateUser, async (req, res) => {
  const { topic, title, body } = req.body;
  const userId = req.user.id;  // Get user ID from authenticated request

  try {
    const response = await sendNotificationToTopic(topic, title, body, userId);
    res.status(200).json({ message: 'Notification sent to topic', response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: List all notifications for the authenticated user
router.get('/list', authenticateUser, async (req, res) => {
  const userId = req.user;  // Get user ID from authenticated request

  try {
    const notifications = await Notification.find({ userId }).sort({ sentAt: -1 });
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
});

// DELETE: Delete a notification by ID
router.delete('/delete/:notificationId', authenticateUser, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error });
  }
});

export default router;
