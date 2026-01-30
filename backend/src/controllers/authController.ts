import { Request, Response } from 'express';
import { prisma } from '../index';
import * as admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin
let adminConfig;
const envConfig = process.env.FIREBASE_SERVICE_ACCOUNT;

if (envConfig) {
    try {
        // Try parsing as raw JSON first
        adminConfig = JSON.parse(envConfig);
    } catch (e) {
        try {
            // If raw JSON fails, try decoding from Base64
            const decoded = Buffer.from(envConfig, 'base64').toString('utf-8');
            adminConfig = JSON.parse(decoded);
            console.log('Successfully parsed FIREBASE_SERVICE_ACCOUNT from Base64');
        } catch (base64Error) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON or Base64:', e);
        }
    }
} else {
    try {
        adminConfig = require(path.join(__dirname, '../../firebase-service-account.json'));
    } catch (e) {
        console.warn('Firebase service account file not found, falling back to env var');
    }
}

if (!admin.apps.length && adminConfig) {
    admin.initializeApp({
        credential: admin.credential.cert(adminConfig)
    });
} else if (!adminConfig) {
    console.error('❌ Firebase Admin could not be initialized: No configuration found.');
}

export const sendOTP = async (req: Request, res: Response) => {
    // With Firebase, the frontend handles sending the OTP.
    // This endpoint can be used for logging or custom logic if needed.
    res.json({ message: 'Firebase handles OTP sending on the frontend' });
};

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        // Verify the ID token using Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number not found in token' });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { phoneNumber },
            include: { profiles: true },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phoneNumber,
                    profiles: {
                        create: {
                            name: 'New User',
                            relationship: 'myself',
                            role: 'caregiver',
                            dateOfBirth: new Date('1990-01-01'),
                        },
                    },
                },
                include: { profiles: true },
            });
        }

        // In production, you might still want to issue your own JWT 
        // or just use the Firebase token for subsequent requests.
        // For now, we'll return a mock token to maintain compatibility with the existing frontend.
        const token = 'mock-jwt-token';

        res.json({
            message: 'OTP verified successfully',
            token,
            user,
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const checkUser = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        res.json({
            exists: !!user,
            message: user ? 'User exists' : 'User not found'
        });
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({ error: 'Failed to check user existence' });
    }
};
