import { Request, Response } from 'express';
import { UserService } from '../../services/userService';
import { Role } from '@prisma/client';
import { catchAsync } from "../../infrastructure/error/errorHandler";
import { NotFoundError, ConflictError, ValidationError, AuthenticationError } from '../../infrastructure/error/errorTypes';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
   * Get all users (admin only)
   */
    getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const users = await this.userService.getAllUsers();

        // Map users to DTOs to remove sensitive information
        const usersDto = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        res.status(200).json(usersDto);
    });

    /**
     * Get user by ID (admin only)
     */
    getUserById = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const user = await this.userService.getUserById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const userDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json(userDto);
    });

    /**
     * Update user (admin only)
     */
    updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { email, name, role } = req.body;

        // Validate that at least one field is provided
        if (!email && !name && !role) {
            throw new ValidationError('At least one field to update is required')
        }

        // Check if user exists
        const existingUser = await this.userService.getUserById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // If email is changing, check if new email is already in use
        if (email && email !== existingUser.email) {
            const userWithEmail = await this.userService.getUserByEmail(email);
            if (userWithEmail && userWithEmail.id !== id) {
                throw new ConflictError('Email already in use')
            }
        }

        // Update user
        const updatedUser = await this.userService.updateUser(id, {
            email,
            name,
            role: role as Role
        });

        const userDto = {
            id: updatedUser!.id,
            name: updatedUser!.name,
            email: updatedUser!.email,
            role: updatedUser!.role,
            createdAt: updatedUser!.createdAt,
            tenantId: updatedUser!.tenantId,
            updatedAt: updatedUser!.updatedAt
        };

        res.status(200).json(userDto);
    });

    /**
     * Delete user (admin only)
     */
    deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await this.userService.getUserById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        await this.userService.deleteUser(id);

        res.status(204).send("User Deleted Successfully.");
    });

    /**
     * Get current user's profile
     */
    getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Get user ID from token
        const userId = (req as Request).user?.userId;

        if (!userId) {
            throw new AuthenticationError('Not authenticated')
        }

        const user = await this.userService.getCurrentUser(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const userDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json(userDto);
    });

    /**
     * Update current user's profile
     */
    updateCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Get user ID from token
        const userId = (req as Request).user?.userId;
        if (!userId) {
            throw new AuthenticationError('Not authenticated')
        }

        const { name, email } = req.body;

        // Validate that at least one field is provided
        if (!name && !email) {
            throw new ValidationError('At least one field to update is required')
        }

        // Check if user exists
        const existingUser = await this.userService.getUserById(userId);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // If email is changing, check if new email is already in use
        if (email && email !== existingUser.email) {
            const userWithEmail = await this.userService.getUserByEmail(email);
            if (userWithEmail && userWithEmail.id !== userId) {
                throw new ConflictError('Email already in use')
            }
        }

        // Update user
        const updatedUser = await this.userService.updateCurrentUser(userId, {
            name,
            email
        });

        const userDto = {
            id: updatedUser!.id,
            name: updatedUser!.name,
            email: updatedUser!.email,
            role: updatedUser!.role,
            tenantId: updatedUser!.tenantId,
            createdAt: updatedUser!.createdAt,
            updatedAt: updatedUser!.updatedAt
        };

        res.status(200).json(userDto);
    });

    /**
     * Update current user's password
     */
    updatePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Get user ID from token
        const userId = (req as Request).user?.userId;

        if (!userId) {
            throw new AuthenticationError('Not authenticated')
        }

        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            throw new ValidationError('Current password and new password are required');
        }

        // Check password complexity
        if (newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        await this.userService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    });

    /**
     * Delete current user's account
     */
    deleteCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Get user ID from token
        const userId = (req as Request).user?.userId;

        if (!userId) {
            throw new AuthenticationError('Not authenticated')
        }

        await this.userService.deleteCurrentUser(userId);

        res.status(204).send('User Deleted.');
    });
}