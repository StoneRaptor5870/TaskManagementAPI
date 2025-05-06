interface AuthConfig {
    JWT_SECRET: string;
    JWT_EXPIRATION: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRATION: string;
    SALT_ROUNDS: number;
}

export const AUTH_CONFIG: AuthConfig = {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION!,
    SALT_ROUNDS: 10
};