import { Router } from 'express';
import { Role } from '@prisma/client';
import { ProjectController } from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const projectController = new ProjectController();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

router.post('/', projectController.createProject);

router.patch('/:id', projectController.updateProject);

router.delete('/:id', projectController.deleteProject);

export const projectRoutes = router;