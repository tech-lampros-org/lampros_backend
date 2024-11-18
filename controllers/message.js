import Message from '../models/message.js';
import User from '../models/user.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Create a new message
    const message = await Message.create({
      sender: req.user,      // The authenticated user is the sender
      receiver: receiverId,  // receiverId comes from the request body
      content,
    });

    // Populate the sender and receiver details
    await message.populate('sender receiver');

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Update a message (e.g., marking it as read)
export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isRead } = req.body;

    // Find and update the message
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user },   // Ensure the authenticated user is the receiver
      { isRead },
      { new: true }
    ).populate('sender receiver');  // Populate sender and receiver details

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message updated successfully', data: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Get a list of messages between authenticated user and another user with full user details
export const listMessages = async (req, res) => {
  try {
    const { otherUserId } = req.query;

    // Fetch messages between the authenticated user and another user
    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user },
      ],
    })
    .sort({ createdAt: 1 })
    .populate('sender receiver');  // Populate sender and receiver details

    // Fetch full details of both the authenticated user and the other user
    const [authenticatedUser, otherUser] = await Promise.all([
      User.findById(req.user),
      User.findById(otherUserId),
    ]);

    if (!authenticatedUser || !otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return both the messages and user data
    res.status(200).json({
      messages,
      sender: authenticatedUser,  // Data of the authenticated user
      receiver: otherUser,        // Data of the other user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find and delete the message (only the sender can delete their message)
    const deletedMessage = await Message.findOneAndDelete({
      _id: messageId,
      sender: req.user,  // Ensure only the sender can delete their message
    });

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};


export const getAllMessagesForUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    console.log("Fetching messages for user:", req.user); // Debug log

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user }, { receiver: req.user }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$sender",
          latestMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" },
      },
      {
        $skip: (pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
    ]);

    console.log("Aggregated Messages:", messages); // Debug log

    const populatedMessages = await Message.populate(messages, [
      { path: "sender" },
      { path: "receiver" },
    ]);

    const totalSenders = await Message.distinct("sender", {
      $or: [{ sender: req.user }, { receiver: req.user }],
    });

    res.status(200).json({
      data: populatedMessages,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalSenders.length / limitNumber),
      totalMessages: totalSenders.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error); // Error log
    res.status(500).json({ error: "Failed to fetch messages for the user" });
  }
};

