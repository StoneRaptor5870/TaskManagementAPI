import { Role } from '@prisma/client';

export interface RegisterUserDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
    tenantId: string
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface DecodedToken extends JwtPayload {
    exp: number;
    iat: number;
}