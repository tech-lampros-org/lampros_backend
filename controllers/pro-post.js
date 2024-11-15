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
    // Extract page and limit from query parameters, set default values if not provided
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Set up pagination options
    const options = {
      page,
      limit,
      populate: { path: 'createdBy', select: '-password' },
      sort: { createdAt: -1 }, // Optional: Sort by 'createdAt' descending
    };

    // Use the paginate method provided by mongoose-paginate-v2
    const result = await Post.paginate({}, options);

    // Send the paginated response
    res.status(200).json({
      currentPage: result.page,
      totalPages: result.totalPages,
      totalPosts: result.totalDocs,
      posts: result.docs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};


// Controller to list posts created by the authenticated user
export const listUserPosts = async (req, res) => {
  try {
    // Extract page, limit, sortBy, and order from query, set default values
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Determine sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch posts created by the authenticated user with pagination, sorting, and populate 'createdBy' field excluding the password
    const posts = await Post.find({ createdBy: req.user._id })
      .populate('createdBy', '-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of user's posts for pagination info
    const total = await Post.countDocuments({ createdBy: req.user._id });
    const totalPages = Math.ceil(total / limit);

    // Check if requested page exceeds total pages
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        message: 'Page number exceeds total pages.',
        currentPage: page,
        totalPages,
        totalPosts: total,
        posts: [],
      });
    }

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalPosts: total,
      posts,
    });
  } catch (error) {
    console.error('Error retrieving user posts:', error);
    res.status(500).json({ message: 'Failed to retrieve user posts', error: error.message });
  }
};

