// routes/searchRoutes.js
import express from 'express';
import { fuzzySearchAll } from '../controllers/serch.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

// Custom middleware to conditionally apply 'protect'
const conditionalProtect = (req, res, next) => {
    if (req.query.user === 'guest') {
      return next(); // Skip protect middleware if user=guest
    }
    return protect(req, res, next); // Apply protect middleware otherwise
  };

// Fuzzy search route with letter support
router.get('/search',conditionalProtect, fuzzySearchAll);

export default router;
