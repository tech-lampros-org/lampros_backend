// routes/searchRoutes.js
import express from 'express';
import { fuzzySearchAll } from '../controllers/serch.js';

const router = express.Router();

// Fuzzy search route with letter support
router.get('/search', fuzzySearchAll);

export default router;
