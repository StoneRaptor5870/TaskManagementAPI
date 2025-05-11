import { Request, Response } from 'express';
import { AuthService } from '../../services/authService';
import { RegisterUserDto, LoginUserDto } from '../../domain/entities/auth';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, TenantSchema } from '../../utils/zodSchemas';
import { Tenant } from '../../domain/entities/tenant';
import { catchAsync } from '../../infrastructure/error/errorHandler';
import { ValidationError, AuthenticationError } from '../../infrastructure/error/errorTypes';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const validationResult = RegisterSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw new ValidationError('Invalid registration data', errorMessages);
        }

        const tenantValidation = TenantSchema.safeParse(req.body);
        if (!tenantValidation.success) {
            const errorMessages = tenantValidation.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw new ValidationError('Invalid tenant data', errorMessages);
        }

        const tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'> = tenantValidation.data;
        const userData: RegisterUserDto = validationResult.data;

        // Register user with tenant creation in a single transaction
        const { tenant, tokens } = await this.authService.registerWithTenant(userData, tenantData);

        res.status(201).json({ tenant, tokens });
    });

    login = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Validate input
        const validationResult = LoginSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw new ValidationError('Invalid login data', errorMessages);
        }

        const loginData: LoginUserDto = validationResult.data;

        const tokens = await this.authService.login(loginData);
        res.status(200).json(tokens);
    });

    logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError('User must be logged in to logout');
        }

        // Logout user
        await this.authService.logout(req.user.userId);

        res.status(200).json({ message: 'Logged out successfully' });
    });

    refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
        // Validate input
        const validationResult = RefreshTokenSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            throw new ValidationError('Refresh token is required', errorMessages);
        }

        const { refreshToken } = validationResult.data;

        // Refresh token
        const tokens = await this.authService.refreshToken(refreshToken);

        res.status(200).json(tokens);
    });
}