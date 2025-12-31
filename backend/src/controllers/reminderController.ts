import { Request, Response } from 'express';
import { prisma } from '../index';

export const getReminders = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const reminders = await prisma.reminder.findMany({
            where: { profileId: profileId as string },
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};

export const addReminder = async (req: Request, res: Response) => {
    try {
        const { profileId, title, description, time } = req.body;
        const reminder = await prisma.reminder.create({
            data: {
                profileId,
                title,
                description,
                time,
            },
        });
        res.json(reminder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add reminder' });
    }
};

export const toggleReminder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;

        const reminder = await prisma.reminder.update({
            where: { id },
            data: {
                completed,
                completedAt: completed ? new Date() : null,
            },
        });
        res.json(reminder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle reminder' });
    }
};
