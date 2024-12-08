// routes/notificationRoutes.js
import express from 'express';
import {
  sendNotificationToDevice,
  sendNotificationToMultipleDevices,
} from '../controllers/notification.js';
import Notification from '../models/notification.js';
import User from '../models/user.js'; // Import User model to fetch tokens

const router = express.Router();

// Middleware to verify authentication and set `req.user`
import { protect as authenticateUser } from '../middlewares/protect.js';

// POST: Send a notification to a specific user
router.post('/sendToUser', authenticateUser, async (req, res) => {
  const { userId, title, body } = req.body;

  try {
    // Fetch the token for the user
    const user = await User.findById(userId);
    if (!user || !user.token) {
      return res.status(404).json({ message: 'User or token not found' });
    }

    const response = await sendNotificationToDevice(user.token, title, body, userId);
    res.status(200).json({ message: 'Notification sent', response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Send notification to multiple users
router.post('/sendToMultipleUsers', authenticateUser, async (req, res) => {
  const { userIds, title, body } = req.body;

  try {
    // Fetch tokens for the users
    const users = await User.find({ _id: { $in: userIds } });
    const tokens = users.map((user) => user.token).filter((token) => token); // Get tokens, filter out null/undefined

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'No valid tokens found for the provided user IDs' });
    }

    const response = await sendNotificationToMultipleDevices(tokens, title, body, userIds);
    res.status(200).json({
      message: 'Notifications sent to users with valid tokens',
      response,
      skippedUsers: userIds.length - tokens.length, // Number of users without tokens
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET: List all notifications for the authenticated user
router.get('/list', authenticateUser, async (req, res) => {
  const userId = req.user; // Get user ID from authenticated request

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
