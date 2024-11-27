import express from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect as authenticateUser } from '../middlewares/protect.js'; // Middleware to authenticate user

const router = express.Router();

// Route: POST /api/questions
// Description: Create a new question
router.post('/', authenticateUser, createQuestion);

// Route: GET /api/questions
// Description: Get all questions with pagination and search
router.get('/', getQuestions);

// Route: GET /api/questions/:questionId
// Description: Get a single question by ID with its answers
router.get('/:questionId', getQuestionById);

// Route: PUT /api/questions/:questionId
// Description: Update a question
router.put('/:questionId', authenticateUser, updateQuestion);

// Route: DELETE /api/questions/:questionId
// Description: Delete a question
router.delete('/:questionId', authenticateUser, deleteQuestion);

export default router;
