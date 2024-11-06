import Message from '../models/message.js';
import User from '../models/user.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = await Message.create({
      sender: req.user,
      receiver: receiverId,
      content,
    });

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Update a message (for example, marking it as read)
export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isRead } = req.body;

    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user }, // Ensure the authenticated user is the receiver
      { isRead },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message updated successfully', data: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Get a list of messages between authenticated user and another user
export const listMessages = async (req, res) => {
  try {
    const { otherUserId } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findOneAndDelete({
      _id: messageId,
      sender: req.user, // Ensure only the sender can delete their message
    });

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Get all messages for the authenticated user with pagination
export const getAllMessagesForUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default page is 1 and limit is 10

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const messages = await Message.find({
      $or: [{ sender: req.user }, { receiver: req.user }],
    })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalMessages = await Message.countDocuments({
      $or: [{ sender: req.user }, { receiver: req.user }],
    });

    res.status(200).json({
      data: messages,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalMessages / limitNumber),
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages for the user' });
  }
};
