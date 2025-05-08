import { Request, Response, NextFunction } from 'express';
import { setTenantId } from '../../infrastructure/database/prisma';
import { UserRepository } from '../../infrastructure/repositories/userRepository';

declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
        }
    }
}

export class TenantMiddleware {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
   * Middleware to extract and attach tenant information to the request
   */
    attachTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('Running tenant middleware');

            // Skip tenant check for public routes
            if (
                req.path.startsWith('/api/auth/login') ||
                req.path.startsWith('/api/auth/register') ||
                req.path.startsWith('/api/auth/refreshToken')
            ) {
                return next();
            }
            console.log('i am here in tenant')

            // Get user from the request (set by auth middleware)
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized: User not authenticated' });
                return;
            }

            // Get user with tenant
            const user = await this.userRepository.findById(userId);

            if (!user?.tenantId) {
                res.status(403).json({ message: 'Forbidden: No tenant assigned to user' });
                return;
            }

            // Set tenantId for use in controllers
            req.tenantId = user.tenantId;
            setTenantId(user.tenantId);
            console.log(`Tenant attached: ${user.tenantId} for user: ${userId}`);
            
            next();
        } catch (error: any) {
            console.error('Tenant middleware error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
   * Middleware to restrict access to specific tenants
   */
    restrictToTenant = (tenantId: string) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.tenantId) {
                res.status(403).json({ message: 'Forbidden: Tenant context missing' });
                return;
            }

            if (req.tenantId !== tenantId) {
                res.status(403).json({ message: 'Forbidden: Invalid tenant access' });
                return;
            }

            next();
        };
    };
}

export const tenantMiddleware = new TenantMiddleware();