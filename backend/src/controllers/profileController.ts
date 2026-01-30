import { Request, Response } from 'express';
import { prisma } from '../index';

export const getProfiles = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(401).json({ error: 'User session invalid or account deleted' });
        }

        const profiles = await prisma.profile.findMany({
            where: { userId },
        });

        res.json(profiles);
    } catch (error) {
        console.error('Get profiles error:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
};

export const createProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { name, relationship, role, dateOfBirth, avatarUrl } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Robust check: Only one "Myself" profile per user
        if (relationship === 'myself') {
            const existingMyself = await prisma.profile.findFirst({
                where: {
                    userId,
                    relationship: 'myself'
                }
            });

            if (existingMyself) {
                return res.status(400).json({ error: 'A "Myself" profile already exists for this account.' });
            }
        }

        const profile = await prisma.profile.create({
            data: {
                userId,
                name,
                relationship,
                role: role || 'dependent',
                dateOfBirth: new Date(dateOfBirth),
                avatarUrl,
            },
        });

        res.json(profile);
    } catch (error) {
        console.error('Create profile error:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Convert dateOfBirth if present
        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }

        const profile = await prisma.profile.update({
            where: { id },
            data,
        });

        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
