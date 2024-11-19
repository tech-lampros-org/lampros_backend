import express from 'express';
import { addProject, listAllProjects, listUserProjects, filterProjects, generalSearchProjects, listAllProjectsByIds } from '../controllers/pro-projects.js';
import { protect } from '../middlewares/protect.js'; 

// Initialize the router
const router = express.Router();

// Route to add a new project (POST /api/projects)
router.post('/projects', protect, addProject);

// Route to list all projects (GET /api/projects/all)
router.get('/projects/all', protect, listAllProjects);
router.post('/projects/Ids', protect, listAllProjectsByIds);

// Route to list projects created by the authenticated user (GET /api/projects/user)
router.get('/projects/user', protect, listUserProjects);

router.get('/projects/filter',protect, filterProjects);
router.get('/projects/search',protect, generalSearchProjects);

export default router;
