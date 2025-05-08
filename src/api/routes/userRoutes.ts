import express from 'express';
import { Role } from '@prisma/client';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const userController = new UserController();

// Current user routes (me)
router.get(
    '/me',
    authMiddleware.authorize([Role.USER]),
    userController.getCurrentUser
);

router.patch(
    '/me',
    authMiddleware.authorize([Role.USER]),
    userController.updateCurrentUser
);

router.put(
    '/me/password',
    authMiddleware.authorize([Role.USER]),
    userController.updatePassword
);

router.delete(
    '/me',
    authMiddleware.authorize([Role.USER]),
    userController.deleteCurrentUser
);

// Admin routes
router.get(
    '/admin',
    authMiddleware.authorize([Role.ADMIN]),
    userController.getAllUsers
);

router.get(
    '/admin/:id',
    authMiddleware.authorize([Role.ADMIN]),
    userController.getUserById
);

router.patch(
    '/admin/:id',
    authMiddleware.authorize([Role.ADMIN]),
    userController.updateUser
);

router.delete(
    '/admin/:id',
    authMiddleware.authorize([Role.ADMIN]),
    userController.deleteUser
);

export const userRoutes = router;
