import { Request, Response } from 'express';
import { prisma } from '../index';
import { v4 as uuidv4 } from 'uuid';

export const createClinicLink = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.body;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const id = uuidv4();
        const url = `http://localhost:5173/clinic-view/${id}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

        const clinicLink = await prisma.clinicLink.create({
            data: {
                id,
                profileId,
                url,
                expiresAt,
            },
        });

        res.json(clinicLink);
    } catch (error) {
        console.error('Create clinic link error:', error);
        res.status(500).json({ error: 'Failed to create clinic link' });
    }
};

export const getClinicLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const clinicLink = await prisma.clinicLink.findUnique({
            where: { id },
            include: {
                profile: {
                    include: {
                        bpReadings: { take: 10, orderBy: { timestamp: 'desc' } },
                        glucoseReadings: { take: 10, orderBy: { timestamp: 'desc' } },
                        documents: { where: { inVisitPack: true } },
                    },
                },
            },
        });

        if (!clinicLink || !clinicLink.active || new Date() > clinicLink.expiresAt) {
            return res.status(404).json({ error: 'Link expired or invalid' });
        }

        res.json(clinicLink);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clinic link' });
    }
};
