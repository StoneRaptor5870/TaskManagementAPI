import { Request, Response, NextFunction } from "express";

/**
 * Colours ANSI Escape Codes
 * 
 * \x1b[31m = red
 * \x1b[33m = yellow
 * \x1b[32m = green
 * \x1b[0m = reset
 */

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse: Record<string, any> = {
        status: 'error',
        message: err.message || 'Internal Server Error'
    };

    if (!isProduction) {
        errorResponse.stack = err.stack;
        errorResponse.error = err;
    }

    if (err.isOperational) {
        if (err.errors) {
            errorResponse.errors = err.errors;
        }
        if (err.code) {
            errorResponse.code = err.code;
        }
    }

    if (isProduction) {
        console.error(`\x1b[31m[ERROR] ${err.name || 'Error'}: ${err.message}\x1b[0m`);
    } else {
        console.error(`\x1b[31m[ERROR] ${err.name || 'Error'}: ${err.message}\x1b[0m`);
        console.error(`\x1b[31m${err.stack}\x1b[0m`);
    }

    res.status(statusCode).json(errorResponse);
}

// Utility function to handle async errors in route handlers
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler - for routes that don't exist
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};