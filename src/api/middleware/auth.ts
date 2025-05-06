import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthService } from "../../services/authService";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: Role;
            };
        }
    }
}

export class AuthMiddleware {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    authenticate = (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Get authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get token
            const token = authHeader.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Verify token
            try {
                const decoded = this.authService.verifyAccessToken(token);
                req.user = decoded;
                next();
            } catch (error) {
                res.status(401).json({ message: 'Invalid token' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Authentication error' });
        }
    }

    authorize = (roles: Role[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }

                if (!roles.includes(req.user.role)) {
                    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
                    return;
                }

                next();
            } catch (error) {
                res.status(500).json({ message: 'Authorization error' });
            }
        };
    };

    // Check if user is the owner of a resource or has admin privileges
    checkOwnership = (
        idExtractor: (req: Request) => Promise<string | null>
    ) => {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }

                // Admin can access any resource
                if (req.user.role === Role.ADMIN) {
                    next();
                    return;
                }

                // Extract owner ID from resource
                const ownerId = await idExtractor(req);

                if (!ownerId) {
                    res.status(404).json({ message: 'Resource not found' });
                    return;
                }

                // Check if user is the owner
                if (req.user.userId !== ownerId) {
                    res.status(403).json({ message: 'Forbidden: You are not the owner of this resource' });
                    return;
                }

                next();
            } catch (error) {
                res.status(500).json({ message: 'Authorization error' });
            }
        };
    };
}

export const authMiddleware = new AuthMiddleware();