import express from 'express';
import { addPost, listAllPosts, listUserPosts } from '../controllers/pro-post.js';
import { protect } from '../middlewares/protect.js'; 

// Initialize the router
const router = express.Router();

// Route to add a new post (POST /api/posts)
router.post('/posts', protect,  addPost);

// Route to list all posts (GET /api/posts/all)
router.get('/posts/all', listAllPosts);

// Route to list posts created by the authenticated user (GET /api/posts/user)
router.get('/posts/user', listUserPosts);

export default router;
