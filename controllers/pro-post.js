import Post from '../models/pro-post.js';

// Controller to handle adding a new post
export const addPost = async (req, res) => {
  try {
    const { title, captions, tags, location, priceDetails, images } = req.body;

    // Create a new post with the data and the logged-in user as the creator
    const post = new Post({
      title,
      captions,
      tags,
      location,
      priceDetails,
      images,
      createdBy: req.user, // Assumes req.user contains the authenticated user's data
    });

    // Save the post to the database
    await post.save();

    // Send a success response
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// Controller to list all posts
export const listAllPosts = async (req, res) => {
  try {
    // Fetch all posts
    const posts = await Post.find().populate('createdBy', 'name email'); // Optionally populate user info

    // Send the posts as a response
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};

// Controller to list posts created by the authenticated user
export const listUserPosts = async (req, res) => {
  try {
    // Fetch posts created by the authenticated user
    const posts = await Post.find({ createdBy: req.user._id });

    // Send the posts as a response
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user posts', error: error.message });
  }
};
