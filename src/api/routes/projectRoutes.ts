import { Router } from 'express';
import { Role } from '@prisma/client';
import { ProjectController } from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';
import { ProjectRepository } from '../../infrastructure/repositories/projectRepository';

const router = Router();
const projectController = new ProjectController();
const projectrepository = new ProjectRepository();

// Middleware to extract project owner ID from a task
const extractProjectOwnership = async (req: any) => {
    const projectId = req.params.id;
    if (!projectId) return null;

    const project = await projectrepository.findById(projectId);
    if (!project || !project.ownerId) return null;

    return project.ownerId;
};


router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

router.post('/',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.USER, Role.ADMIN]),
    // authMiddleware.checkOwnership(extractProjectOwnership),
    projectController.createProject
);

router.patch('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.USER, Role.ADMIN]),
    authMiddleware.checkOwnership(extractProjectOwnership),
    projectController.updateProject
);

router.delete('/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.USER, Role.ADMIN]),
    authMiddleware.checkOwnership(extractProjectOwnership),
    projectController.deleteProject
);

export const projectRoutes = router;