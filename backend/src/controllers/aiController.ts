import { Request, Response } from 'express';
import { generateHealthInsights, translateLabReport } from '../services/aiService';
import { prisma } from '../index';

export const getInsights = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.params;

        // Fetch recent data for context
        const bpReadings = await prisma.bPReading.findMany({
            where: { profileId },
            take: 10,
            orderBy: { timestamp: 'desc' },
        });

        const glucoseReadings = await prisma.glucoseReading.findMany({
            where: { profileId },
            take: 10,
            orderBy: { timestamp: 'desc' },
        });

        const symptoms = await prisma.symptom.findMany({
            where: { profileId },
            take: 5,
            orderBy: { timestamp: 'desc' },
        });

        const insights = await generateHealthInsights({
            bpReadings,
            glucoseReadings,
            symptoms,
        });

        res.json({ insights });
    } catch (error) {
        console.error('Insights Controller Error:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
};

export const translateReport = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Report text is required' });

        const translation = await translateLabReport(text);
        res.json({ translation });
    } catch (error) {
        console.error('Translation Controller Error:', error);
        res.status(500).json({ error: 'Failed to translate report' });
    }
};
