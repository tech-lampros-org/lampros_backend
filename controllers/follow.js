import User from '../models/user.js'; // Adjust path as needed

// POST: Follow another user
export const followUser = async (req, res) => {
  const userId = req.user; // Authenticated user's ID
  const { targetUserId } = req.body; // ID of the user to follow

  try {
    // Find the target user
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);

    if (!targetUser || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already following the target user
    if (user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add target user to 'following' of current user and add current user to 'followers' of target user
    user.following.push(targetUserId);
    targetUser.followers.push(userId);

    // Save both user documents
    await user.save();
    await targetUser.save();

    res.status(200).json({ message: 'Successfully followed the user' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error });
  }
};

// GET: Get followers with pagination
export const getFollowers = async (req, res) => {
  const userId = req.user; // Authenticated user's ID
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    // Find the user's followers and populate their details
    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'fname lname profileImage', // Specify the fields to retrieve
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
      })
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get total count of followers for pagination metadata
    const totalFollowers = user.followers.length;

    res.status(200).json({
      followers: user.followers,
      currentPage: page,
      totalPages: Math.ceil(totalFollowers / limit),
      totalFollowers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving followers', error });
  }
};
