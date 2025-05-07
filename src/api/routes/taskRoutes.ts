import { Router } from 'express';
import { Role } from '@prisma/client';
import { TaskController } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import { TaskRepository } from '../../infrastructure/repositories/taskRepository';

const router = Router();
const taskController = new TaskController();
const taskRepository = new TaskRepository();

// Middleware to extract project owner ID from a task
const extractTaskOwnership = async (req: any) => {
    const taskId = req.params.id;
    if (!taskId) return null;

    const task = await taskRepository.findById(taskId);
    if (!task || !task.project) return null;

    return task.project.ownerId;
};

// Routes accessible by all authenticated users
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);

// Routes accessible by managers and admins
router.post('/', 
  authMiddleware.authenticate,
  authMiddleware.authorize([Role.USER, Role.ADMIN]), 
  taskController.createTask
);

// Routes that require ownership check or admin privileges
router.put('/:id', 
  authMiddleware.checkOwnership(extractTaskOwnership), 
  taskController.updateTask
);

router.delete('/:id', 
  authMiddleware.checkOwnership(extractTaskOwnership), 
  taskController.deleteTask
);

router.patch('/:id/status', 
  authMiddleware.checkOwnership(extractTaskOwnership), 
  taskController.updateTaskStatus
);

// TODO: Not in use rn.
router.patch('/:id/assign', 
  authMiddleware.checkOwnership(extractTaskOwnership), 
  taskController.assignTask
);

export const taskRoutes = router;