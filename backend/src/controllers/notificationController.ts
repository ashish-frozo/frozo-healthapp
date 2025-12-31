import { Request, Response } from 'express';
import { prisma } from '../index';
import { socketService } from '../services/socketService';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const notifications = await prisma.notification.findMany({
            where: { profileId: profileId as string },
            orderBy: { timestamp: 'desc' },
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

export const addNotification = async (req: Request, res: Response) => {
    try {
        const { profileId, title, message, type, priority, actionUrl } = req.body;
        const notification = await prisma.notification.create({
            data: {
                profileId,
                title,
                message,
                type,
                priority,
                actionUrl,
            },
            include: {
                profile: true
            }
        });

        // Send real-time notification to the user owning this profile
        socketService.sendToUser(notification.profile.userId, 'new_notification', notification);

        res.json(notification);
    } catch (error) {
        console.error('Add notification error:', error);
        res.status(500).json({ error: 'Failed to add notification' });
    }
};
