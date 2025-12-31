import { Request, Response } from 'express';
import { prisma } from '../index';
import { socketService } from '../services/socketService';

export const sendNudge = async (req: Request, res: Response) => {
    try {
        const { targetProfileId, message } = req.body;
        const senderUserId = req.headers['x-user-id'] as string;

        if (!targetProfileId || !message) {
            return res.status(400).json({ error: 'Target profile ID and message are required' });
        }

        // Find the target profile and its owner
        const targetProfile = await prisma.profile.findUnique({
            where: { id: targetProfileId },
            include: { user: true },
        });

        if (!targetProfile) {
            return res.status(404).json({ error: 'Target profile not found' });
        }

        // Create a notification for the target profile
        const notification = await prisma.notification.create({
            data: {
                profileId: targetProfileId,
                title: 'Caregiver Nudge',
                message,
                type: 'reminder',
                priority: 'high',
            },
        });

        // Send real-time nudge to the target user
        socketService.sendToUser(targetProfile.userId, 'new_nudge', {
            notification,
            senderUserId,
        });

        res.json({ message: 'Nudge sent successfully', notification });
    } catch (error) {
        console.error('Send nudge error:', error);
        res.status(500).json({ error: 'Failed to send nudge' });
    }
};

export const getFamilyOverview = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find all profiles owned by this user
        const profiles = await prisma.profile.findMany({
            where: { userId },
            include: {
                bpReadings: { take: 1, orderBy: { timestamp: 'desc' } },
                glucoseReadings: { take: 1, orderBy: { timestamp: 'desc' } },
                notifications: { where: { isRead: false } },
            },
        });

        res.json(profiles);
    } catch (error) {
        console.error('Get family overview error:', error);
        res.status(500).json({ error: 'Failed to fetch family overview' });
    }
};
