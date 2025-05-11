import { AppError } from './errorHandler';

export class ValidationError extends AppError {
    constructor(message: string, errors?: any) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = errors;
    }
    errors?: any;
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Permission denied') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

export class UserExistsError extends AppError {
    constructor(message = 'User already exists') {
        super(message, 409);
        this.name = 'ConfictError'
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, false); // Not operational as it's a system error
        this.name = 'DatabaseError';
    }
}

export class ServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false); // Not operational as it's a system error
        this.name = 'ServerError';
    }
}