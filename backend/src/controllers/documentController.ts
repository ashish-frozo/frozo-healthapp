import { Request, Response } from 'express';
import { prisma } from '../index';
import fs from 'fs/promises';
import { classifyDocument } from '../services/aiService';
import pdfParse from 'pdf-parse';

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
        const { profileId, title, date, tags, inVisitPack } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        let category = 'other';
        let classificationConfidence = 0;

        // Extract text from PDF and classify
        try {
            const dataBuffer = await fs.readFile(file.path);

            const pdfData = await pdfParse(dataBuffer);
            const extractedText = pdfData.text;

            if (extractedText && extractedText.trim().length > 50) {
                const classification = await classifyDocument(extractedText);
                category = classification.category;
                classificationConfidence = classification.confidence;
                console.log('Document classified:', { category, confidence: classificationConfidence });
            } else {
                console.warn('Insufficient text extracted from PDF, defaulting to "other"');
            }
        } catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            // Continue with default category
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
                classificationConfidence,
                manuallyOverridden: false,
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

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, category, date, tags, manuallyOverridden } = req.body;

        const document = await prisma.document.update({
            where: { id },
            data: {
                title,
                category,
                date: date ? new Date(date) : undefined,
                tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined,
                manuallyOverridden: manuallyOverridden === undefined ? true : manuallyOverridden,
            },
        });
        res.json(document);
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
};
