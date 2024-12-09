import express from 'express';
import { 
  addProject, 
  listAllProjects, 
  listUserProjects, 
  filterProjects, 
  generalSearchProjects, 
  listAllProjectsByIds 
} from '../controllers/pro-projects.js';
import { protect } from '../middlewares/protect.js';

// Initialize the router
const router = express.Router();

// Custom middleware to conditionally apply 'protect'
const conditionalProtect = (req, res, next) => {
  if (req.query.user === 'guest') {
    return next(); // Skip protect middleware if user=guest
  }
  return protect(req, res, next); // Apply protect middleware otherwise
};

// Route to add a new project (POST /api/projects)
router.post('/projects', protect, addProject);

// Route to list all projects (GET /api/projects/all)
router.get('/projects/all', conditionalProtect, listAllProjects);
router.post('/projects/Ids', protect, listAllProjectsByIds);

// Route to list projects created by the authenticated user (GET /api/projects/user)
router.get('/projects/user', protect, listUserProjects);

router.get('/projects/filter', conditionalProtect, filterProjects);
router.get('/projects/search', conditionalProtect, generalSearchProjects);

export default router;
