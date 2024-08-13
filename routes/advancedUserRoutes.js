// routes/advancedUserRoutes.js
import express from 'express';
import { createAdvancedUser } from '../controllers/user.js';

const router = express.Router();

// Route for creating an advanced user
router.post('/create-advanced-user', createAdvancedUser);

export default router;
