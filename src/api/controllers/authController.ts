import { Request, Response } from 'express';
import { AuthService } from '../../services/authService';
import { RegisterUserDto, LoginUserDto } from '../../domain/entities/auth';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, TenantSchema } from '../../utils/zodSchemas';
import { TenantService } from '../../services/tenant.service';
import { Tenant } from '../../domain/entities/tenant';

export class AuthController {
    private authService: AuthService;
    private tenantService: TenantService

    constructor() {
        this.authService = new AuthService();
        this.tenantService = new TenantService();
    }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = RegisterSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({ errors: errorMessages });
                return;
            }

            const tenantValidation = TenantSchema.safeParse(req.body);
            if (!tenantValidation.success) {
                const errorMessages = tenantValidation.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({ errors: errorMessages });
                return;
            }

            const tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'> = tenantValidation.data;
            const userData = validationResult.data;

            const tenant = await this.tenantService.createTenant(tenantData);
            const tenantId = tenant.id;

            const newUserData: RegisterUserDto = {
                ...userData,
                tenantId,
            };

            // Register user
            const tokens = await this.authService.register(newUserData);

            res.status(201).json({ tenant, tokens });
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Registration failed' });
            }
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate input
            const validationResult = LoginSchema.safeParse(req.body);
            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({ errors: errorMessages });
                return;
            }

            const loginData: LoginUserDto = validationResult.data;

            // Login user
            const tokens = await this.authService.login(loginData);

            res.status(200).json(tokens);
        } catch (error: any) {
            if (error.message.includes('Invalid credentials')) {
                res.status(401).json({ message: 'Invalid email or password' });
            } else {
                res.status(500).json({ message: 'Login failed' });
            }
        }
    };

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Logout user
            await this.authService.logout(req.user.userId);

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Logout failed' });
        }
    };

    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate input
            const validationResult = RefreshTokenSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({ message: 'Refresh token is required' });
                return;
            }

            const { refreshToken } = validationResult.data;

            // Refresh token
            const tokens = await this.authService.refreshToken(refreshToken);

            res.status(200).json(tokens);
        } catch (error: any) {
            if (error.message.includes('Invalid refresh token')) {
                res.status(401).json({ message: 'Invalid refresh token' });
            } else {
                res.status(500).json({ message: 'Token refresh failed' });
            }
        }
    };
}