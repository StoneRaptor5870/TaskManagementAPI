import { Request, Response, NextFunction } from 'express';
import { setTenantId } from '../../infrastructure/database/prisma';
import { UserService } from '../../services/userService';
import { AuthenticationError, AuthorizationError } from '../../infrastructure/error/errorTypes';

declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
        }
    }
}

export class TenantMiddleware {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
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
                throw new AuthenticationError('Unauthorized: User not authenticated')
            }

            // Get user with tenant
            const user = await this.userService.getUserById(userId);

            if (!user?.tenantId) {
                throw new AuthorizationError('Forbidden: No tenant assigned to user')
            }

            // Set tenantId for use in controllers
            req.tenantId = user.tenantId;
            setTenantId(user.tenantId);
            console.log(`Tenant attached: ${user.tenantId} for user: ${userId}`);
            
            next();
        } catch (error: any) {
            console.error('Tenant middleware error:', error);
            next(error);
        }
    }

    /**
   * Middleware to restrict access to specific tenants
   */
    restrictToTenant = (tenantId: string) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.tenantId) {
                throw new AuthorizationError('Forbidden: Tenant context missing');
            }

            if (req.tenantId !== tenantId) {
                throw new AuthorizationError('Forbidden: Invalid tenant access')
            }

            next();
        };
    };
}

export const tenantMiddleware = new TenantMiddleware();