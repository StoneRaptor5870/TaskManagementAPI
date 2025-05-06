import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware.authenticate, authController.logout);

export const authRoutes = router;