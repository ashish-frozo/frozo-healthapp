import { Request, Response } from 'express';
import { prisma } from '../index';

// Blood Pressure
export const getBPReadings = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const readings = await prisma.bPReading.findMany({
            where: { profileId: profileId as string },
            orderBy: { timestamp: 'desc' },
        });
        res.json(readings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch BP readings' });
    }
};

export const addBPReading = async (req: Request, res: Response) => {
    try {
        const { profileId, systolic, diastolic, pulse, status, timestamp } = req.body;
        const reading = await prisma.bPReading.create({
            data: {
                profileId,
                systolic,
                diastolic,
                pulse,
                status,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });
        res.json(reading);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add BP reading' });
    }
};

// Glucose
export const getGlucoseReadings = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const readings = await prisma.glucoseReading.findMany({
            where: { profileId: profileId as string },
            orderBy: { timestamp: 'desc' },
        });
        res.json(readings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch glucose readings' });
    }
};

export const addGlucoseReading = async (req: Request, res: Response) => {
    try {
        const { profileId, value, context, status, timestamp } = req.body;
        const reading = await prisma.glucoseReading.create({
            data: {
                profileId,
                value,
                context,
                status,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });
        res.json(reading);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add glucose reading' });
    }
};

// Symptoms
export const getSymptoms = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const symptoms = await prisma.symptom.findMany({
            where: { profileId: profileId as string },
            orderBy: { timestamp: 'desc' },
        });
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
};

export const addSymptom = async (req: Request, res: Response) => {
    try {
        const { profileId, name, severity, notes, timestamp } = req.body;
        const symptom = await prisma.symptom.create({
            data: {
                profileId,
                name,
                severity,
                notes,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });
        res.json(symptom);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add symptom' });
    }
};
