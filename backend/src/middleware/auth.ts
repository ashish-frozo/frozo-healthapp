import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const userId = req.headers['x-user-id'] as string;

    if (!authHeader || !userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing token or user ID' });
    }

    // In production, verify the JWT token here
    // For now, we'll trust the mock token
    if (authHeader !== 'Bearer mock-jwt-token') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    next();
};
