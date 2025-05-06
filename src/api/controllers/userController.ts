import { Request, Response } from 'express';
import { UserService } from '../../services/userService';
import { Role } from '@prisma/client';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
   * Get all users (admin only)
   */
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();

            // Map users to DTOs to remove sensitive information
            const usersDto = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            res.status(200).json(usersDto);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Get user by ID (admin only)
     */
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const userDto = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            res.status(200).json(userDto);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Update user (admin only)
     */
    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { email, name, role } = req.body;

            // Validate that at least one field is provided
            if (!email && !name && !role) {
                res.status(400).json({ message: 'At least one field to update is required' });
                return;
            }

            // Check if user exists
            const existingUser = await this.userService.getUserById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // If email is changing, check if new email is already in use
            if (email && email !== existingUser.email) {
                const userWithEmail = await this.userService.getUserByEmail(email);
                if (userWithEmail && userWithEmail.id !== id) {
                    res.status(409).json({ message: 'Email already in use' });
                    return;
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
                updatedAt: updatedUser!.updatedAt
            };

            res.status(200).json(userDto);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Delete user (admin only)
     */
    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await this.userService.getUserById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const success = await this.userService.deleteUser(id);

            if (success) {
                res.status(204).send("User Deleted Successfully.");
            } else {
                res.status(500).json({ message: 'Failed to delete user' });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Get current user's profile
     */
    getCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Get user ID from token
            const userId = (req as Request).user?.userId;
            console.log(userId)

            if (!userId) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const user = await this.userService.getCurrentUser(userId);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const userDto = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            res.status(200).json(userDto);
        } catch (error) {
            console.error('Error fetching current user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Update current user's profile
     */
    updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Get user ID from token
            const userId = (req as Request).user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const { name, email } = req.body;

            // Validate that at least one field is provided
            if (!name && !email) {
                res.status(400).json({ message: 'At least one field to update is required' });
                return;
            }

            // Check if user exists
            const existingUser = await this.userService.getUserById(userId);
            if (!existingUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // If email is changing, check if new email is already in use
            if (email && email !== existingUser.email) {
                const userWithEmail = await this.userService.getUserByEmail(email);
                if (userWithEmail && userWithEmail.id !== userId) {
                    res.status(409).json({ message: 'Email already in use' });
                    return;
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
                createdAt: updatedUser!.createdAt,
                updatedAt: updatedUser!.updatedAt
            };

            res.status(200).json(userDto);
        } catch (error) {
            console.error('Error updating current user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Update current user's password
     */
    updatePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            // Get user ID from token
            const userId = (req as Request).user?.userId;

            if (!userId) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const { currentPassword, newPassword } = req.body;

            // Validate required fields
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'Current password and new password are required' });
                return;
            }

            // Check password complexity
            if (newPassword.length < 8) {
                res.status(400).json({ message: 'Password must be at least 8 characters long' });
                return;
            }

            try {
                // Update password
                await this.userService.updatePassword(userId, currentPassword, newPassword);
                res.status(200).json({ message: 'Password updated successfully' });
            } catch (err: any) {
                if (err.message === 'Current password is incorrect') {
                    res.status(400).json({ message: 'Current password is incorrect' });
                } else {
                    throw err;
                }
            }
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    /**
     * Delete current user's account
     */
    deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            // Get user ID from token
            const userId = (req as Request).user?.userId;

            if (!userId) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const success = await this.userService.deleteCurrentUser(userId);

            if (success) {
                res.status(204).send('User Deleted.');
            } else {
                res.status(500).json({ message: 'Failed to delete user' });
            }
        } catch (error) {
            console.error('Error deleting current user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}