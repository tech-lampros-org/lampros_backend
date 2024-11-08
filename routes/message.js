import express from 'express';
import {
  sendMessage,
  updateMessage,
  listMessages,
  deleteMessage,
  getAllMessagesForUser,
} from '../controllers/message.js';

const router = express.Router();

// POST: Send a message
router.post('/send', sendMessage);

// PUT: Update a message (e.g., mark as read)
router.put('/update/:messageId', updateMessage);

// GET: List messages between authenticated user and another user
router.get('/list', listMessages);

// DELETE: Delete a message
router.delete('/delete/:messageId', deleteMessage);

// GET: Paginated messages for authenticated user
router.get('/user/messages', getAllMessagesForUser);

export default router;
