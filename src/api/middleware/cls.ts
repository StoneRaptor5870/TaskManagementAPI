import { Request, Response, NextFunction } from 'express';
import { namespace, NAMESPACE_NAME } from '../../infrastructure/database/prisma';

/**
 * Middleware to bind the CLS namespace to each request
 * This ensures that the tenant context is maintained throughout the request lifecycle
 */
export const clsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Bind request and response to the namespace
  namespace.bindEmitter(req);
  namespace.bindEmitter(res);
  
  // Create a new context for this request
  namespace.run(() => {
    console.log(`CLS namespace context '${NAMESPACE_NAME}' created for request`);
    next();
  });
};