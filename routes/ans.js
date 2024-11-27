import express from 'express';
import {
  createAnswer,
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  getAnswerById,
} from '../controllers/answerController.js';
import { protect as authenticateUser } from '../middlewares/protect.js'; // Middleware to authenticate user

const router = express.Router();

// Route: POST /api/answers
// Description: Create a new answer or reply
router.post('/', authenticateUser, createAnswer);

// Route: GET /api/answers/question/:questionId
// Description: Get all top-level answers for a specific question with pagination
router.get('/question/:questionId', getAnswersByQuestion);

// Route: GET /api/answers/:answerId
// Description: Get a single answer by ID with its replies
router.get('/:answerId', getAnswerById);

// Route: PUT /api/answers/:answerId
// Description: Update an answer or reply
router.put('/:answerId', authenticateUser, updateAnswer);

// Route: DELETE /api/answers/:answerId
// Description: Delete an answer or reply
router.delete('/:answerId', authenticateUser, deleteAnswer);

export default router;
