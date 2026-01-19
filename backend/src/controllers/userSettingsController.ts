import { Request, Response } from 'express';
import { prisma } from '../index';

// Get user settings
export const getUserSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phoneNumber: true,
                preferredLanguage: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user settings error:', error);
        res.status(500).json({ error: 'Failed to get user settings' });
    }
};

// Update user settings
export const updateUserSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { preferredLanguage } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate language
        const validLanguages = ['english', 'hindi', 'hinglish'];
        if (preferredLanguage && !validLanguages.includes(preferredLanguage)) {
            return res.status(400).json({ error: 'Invalid language. Must be: english, hindi, or hinglish' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(preferredLanguage && { preferredLanguage }),
            },
            select: {
                id: true,
                phoneNumber: true,
                preferredLanguage: true,
            }
        });

        res.json({
            message: 'Settings updated successfully',
            user,
        });
    } catch (error) {
        console.error('Update user settings error:', error);
        res.status(500).json({ error: 'Failed to update user settings' });
    }
};
