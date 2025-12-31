import { Request, Response } from 'express';
import { prisma } from '../index';

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.query;
        if (!profileId) return res.status(400).json({ error: 'Profile ID is required' });

        const documents = await prisma.document.findMany({
            where: { profileId: profileId as string },
            orderBy: { date: 'desc' },
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

export const addDocument = async (req: Request, res: Response) => {
    try {
        const { profileId, title, category, date, tags, inVisitPack } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const document = await prisma.document.create({
            data: {
                profileId,
                title,
                category,
                date: new Date(date),
                fileUrl: `/uploads/${file.filename}`,
                thumbnailUrl: `/uploads/${file.filename}`, // In production, generate a real thumbnail
                tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
                inVisitPack: inVisitPack === 'true' || inVisitPack === true,
            },
        });
        res.json(document);
    } catch (error) {
        console.error('Add document error:', error);
        res.status(500).json({ error: 'Failed to add document' });
    }
};

export const toggleVisitPack = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { inVisitPack } = req.body;

        const document = await prisma.document.update({
            where: { id },
            data: { inVisitPack },
        });
        res.json(document);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle visit pack' });
    }
};
