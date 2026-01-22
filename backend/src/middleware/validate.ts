import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Generic validation middleware using Zod schemas
 * Validates request body, query params, and route params
 */
export const validate = (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        if (!result.success) {
            const errors = result.error.flatten();
            logger.warn({ errors, path: req.path }, 'Validation failed');

            return res.status(400).json({
                error: 'Validation failed',
                details: errors.fieldErrors
            });
        }

        next();
    };

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.flatten();
            logger.warn({ errors, path: req.path }, 'Body validation failed');

            return res.status(400).json({
                error: 'Validation failed',
                details: errors.fieldErrors
            });
        }

        // Replace body with parsed (and coerced) data
        req.body = result.data;
        next();
    };

/**
 * Validate only query params
 */
export const validateQuery = (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const errors = result.error.flatten();
            logger.warn({ errors, path: req.path }, 'Query validation failed');

            return res.status(400).json({
                error: 'Validation failed',
                details: errors.fieldErrors
            });
        }

        next();
    };
