import Answer from '../models/ans.js';
import Question from '../models/qs.js';

// Create a new answer or reply
export const createAnswer = async (req, res) => {
  try {
    const { questionId, parentId, content } = req.body;
    const userId = req.user; // Assuming user is authenticated and user ID is in req.user

    // Validate question existence
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // If it's a reply, validate the parent answer
    let parentAnswer = null;
    if (parentId) {
      parentAnswer = await Answer.findById(parentId);
      if (!parentAnswer) {
        return res.status(404).json({ message: 'Parent answer not found' });
      }

      // Ensure the parent answer belongs to the same question
      if (parentAnswer.question.toString() !== questionId) {
        return res.status(400).json({ message: 'Parent answer does not belong to the specified question' });
      }
    }

    // Create the answer
    const answer = new Answer({
      question: questionId,
      user: userId,
      content,
      parent: parentId || null,
    });

    await answer.save();

    // If it's a reply, add it to the parent's replies array
    if (parentAnswer) {
      parentAnswer.replies.push(answer._id);
      await parentAnswer.save();
    }

    // Add the answer to the question's answers array
    question.answers.push(answer._id);
    await question.save();

    res.status(201).json({ message: 'Answer created successfully', answer });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all answers for a specific question with pagination and nested replies
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate question existence
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'fname lname profileImage' },
        { path: 'replies', populate: { path: 'user', select: 'fname lname profileImage' } },
      ],
    };

    const answers = await Answer.paginate(
      { question: questionId, parent: null },
      options
    );

    res.status(200).json({ ...answers, question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an answer or reply
export const updateAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;
    const userId = req.user;

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if the user is the owner of the answer
    if (answer.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this answer' });
    }

    // Update content
    if (content !== undefined) answer.content = content;

    await answer.save();

    res.status(200).json({ message: 'Answer updated successfully', answer });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete an answer or reply
export const deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const userId = req.user;
    const userRole = req.user.role; // Assuming user role is available

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if the user is the owner or an admin
    if (answer.user.toString() !== userId.toString() && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this answer' });
    }

    // If the answer has a parent, remove this answer from the parent's replies array
    if (answer.parent) {
      const parentAnswer = await Answer.findById(answer.parent);
      if (parentAnswer) {
        parentAnswer.replies.pull(answer._id);
        await parentAnswer.save();
      }
    }

    // Remove all child replies recursively (optional)
    const removeReplies = async (parentId) => {
      const childAnswers = await Answer.find({ parent: parentId });
      for (const child of childAnswers) {
        await removeReplies(child._id);
        await child.remove();
      }
    };

    await removeReplies(answer._id);

    // Remove the answer from the question's answers array
    const question = await Question.findById(answer.question);
    if (question) {
      question.answers.pull(answer._id);
      await question.save();
    }

    // Remove the answer
    await answer.remove();

    res.status(200).json({ message: 'Answer and its replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single answer by ID with nested replies
export const getAnswerById = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await Answer.findById(answerId)
      .populate('user', 'fname lname profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'fname lname profileImage' },
      });

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
