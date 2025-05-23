import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import { AUTH_CONFIG } from "../config/auth";
import { UserService } from "./userService";
import { RegisterUserDto, LoginUserDto, JwtPayload, AuthTokens, DecodedToken } from "../domain/entities/auth";
import { TenantService } from "./tenantService";
import db from "../infrastructure/database/prisma";
import { Tenant } from "../domain/entities/tenant";
import { StringValue } from 'ms';
import { AuthenticationError, UserExistsError, DatabaseError } from "../infrastructure/error/errorTypes";

export class AuthService {
    private prisma: PrismaClient;
    private userService: UserService;
    private tenantService: TenantService;

    constructor() {
        this.prisma = db;
        this.userService = new UserService();
        this.tenantService = new TenantService();
    }

    async registerWithTenant(
        userData: RegisterUserDto,
        tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<{ tenant: Tenant, tokens: AuthTokens }> {
        const existingUser = await this.userService.getUserByEmail(userData.email);
        if (existingUser) {
            throw new UserExistsError('User already exists with this email');
        }

        try {
            // A transaction for tenant and user creation
            return await this.prisma.$transaction(async (tx) => {
                // Create tenant within transaction
                const tenant = await this.tenantService.createTenant(tenantData, tx);

                const hashedPassword = await bcrypt.hash(userData.password, AUTH_CONFIG.SALT_ROUNDS);

                // Create user with tenant ID within the same transaction
                const user = await this.userService.createUser({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role || Role.USER,
                    tenantId: tenant.id
                }, tx);

                // Generate tokens
                const tokens = this.generateTokens({
                    userId: user.id,
                    email: user.email,
                    role: user.role
                });

                await this.userService.updateRefreshToken(user.id, tokens.refreshToken, tx);

                return { tenant, tokens };
            });
        } catch (error) {
            throw new DatabaseError('Failed to register user and tenant');
        }
    }

    async login(loginData: LoginUserDto): Promise<AuthTokens> {
        const user = await this.userService.getUserByEmail(loginData.email);
        if (!user) {
            throw new AuthenticationError('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid email or password')
        }

        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Save refresh token
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string): Promise<void> {
        // Clear refresh token
        await this.userService.updateRefreshToken(userId, null);
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                AUTH_CONFIG.REFRESH_TOKEN_SECRET
            ) as DecodedToken;

            // Find user by ID
            const user = await this.userService.getUserById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw new AuthenticationError('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            // Save new refresh token
            await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new AuthenticationError('Invalid refresh token');
        }
    }

    verifyAccessToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as DecodedToken;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            throw new AuthenticationError('Invalid access token');
        }
    }

    private generateTokens(payload: JwtPayload): AuthTokens {
        const accessToken = jwt.sign(
            payload,
            AUTH_CONFIG.JWT_SECRET as jwt.Secret,
            {
                expiresIn: AUTH_CONFIG.JWT_EXPIRATION as StringValue
            }
        );

        const refreshToken = jwt.sign(
            payload,
            AUTH_CONFIG.REFRESH_TOKEN_SECRET as jwt.Secret,
            {
                expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRATION as StringValue
            }
        );

        return { accessToken, refreshToken };
    }
}