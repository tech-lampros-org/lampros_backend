import express from 'express';
import { followUser, getFollowers ,getFollowing,unfollowUser} from '../controllers/follow.js';

const router = express.Router();

// Route to follow a user
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser)

// Route to get followers with pagination
router.get('/followers', getFollowers);
router.get('/following', getFollowing);


export default router;
