import Question from '../models/qs.js';
import Answer from '../models/ans.js';

// Create a new question
export const createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const userId = req.user; // Assuming user is authenticated and user ID is in req.user

    // Create the question
    const question = new Question({
      title,
      description,
      tags,
      user: userId,
    });

    await question.save();

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all questions with pagination and search
export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tags = [], user } = req.query;

    // Build the initial query
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (tags.length > 0) {
      query.tags = { $in: tags.split(',') };
    }

    // Pagination options
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitValue = parseInt(limit, 10);

    // Fetch data with Mongoose
    const questions = await Question.find(query)
      .populate('user', 'fname lname profileImage address.place')
      .populate({
        path: 'answers',
        populate: { path: 'user', select: 'fname lname profileImage address.place' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitValue);

    // Filter questions based on the `user` parameter in answers
    const filteredQuestions = user
      ? questions.filter((question) =>
          question.answers.some((answer) => answer.user._id.toString() === user)
        )
      : questions;

    res.status(200).json({
      questions: filteredQuestions,
      totalQuestions: filteredQuestions.length,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(filteredQuestions.length / limitValue),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




// Get a single question by ID with its answers
export const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate('user', 'fname lname profileImage address.place')
      .populate({
        path: 'answers',
        populate: {
          path: 'user',
          select: 'fname lname profileImage address.place',
        },
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.user;

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if the user is the owner of the question
    if (question.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this question' });
    }

    // Update fields
    if (title !== undefined) question.title = title;
    if (description !== undefined) question.description = description;
    if (tags !== undefined) question.tags = tags;

    await question.save();

    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user;
    const userRole = req.user.role; // Assuming user role is available

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if the user is the owner or an admin
    // if (question.user.toString() !== userId.toString() && userRole !== 'Admin') {
    //   return res.status(403).json({ message: 'Unauthorized to delete this question' });
    // }

    // Delete all associated answers
    await Answer.deleteMany({ question: questionId });

    // Delete the question
    await question.remove();

    res.status(200).json({ message: 'Question and associated answers deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
