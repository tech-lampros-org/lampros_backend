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


// GET: Check if the authenticated user is following the target user
export const isFollowing = async (req, res) => {
  const userId = req.user; // Authenticated user's ID
  const { targetUserId } = req.params; // ID of the target user to check from route parameters

  try {
    // Find the authenticated user
    const user = await User.findById(userId)
    const target = await User.findById(targetUserId);


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the target user ID is in the 'following' array of the authenticated user
    const isFollowing = user.following.includes(targetUserId);

    res.status(200).json({ isFollowing:isFollowing, followersCount: target?.followers?.length });
  } catch (error) {
    res.status(500).json({ message: 'Error checking following status', error });
  }
};



// GET: Get following with pagination
export const getFollowing = async (req, res) => {
    const userId = req.user; // Authenticated user's ID
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page
  
    try {
      // Find the user's following list and populate their details
      const user = await User.findById(userId)
        .populate({
          path: 'following',
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
  
      // Get total count of following for pagination metadata
      const totalFollowing = user.following.length;
  
      res.status(200).json({
        following: user.following,
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        totalFollowing,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving following', error });
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


// POST: Unfollow another user
export const unfollowUser = async (req, res) => {
  const userId = req.user; // Authenticated user's ID
  const { targetUserId } = req.body; // ID of the user to unfollow

  try {
    // Find the target user and the authenticated user
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);

    if (!targetUser || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already not following the target user
    if (!user.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove target user from 'following' list of the current user
    user.following = user.following.filter(id => id.toString() !== targetUserId);

    // Remove current user from 'followers' list of the target user
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    // Save both user documents
    await user.save();
    await targetUser.save();

    res.status(200).json({ message: 'Successfully unfollowed the user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};
