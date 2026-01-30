import { Request, Response } from 'express';
import { prisma } from '../index';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a device token for biometric authentication
 * Called after successful OTP verification when user enables biometric
 */
export const generateDeviceToken = async (req: Request, res: Response) => {
    try {
        const { idToken, deviceInfo } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        if (!deviceInfo || !deviceInfo.deviceId || !deviceInfo.platform) {
            return res.status(400).json({
                error: 'Device info (deviceId, platform) is required'
            });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number not found in token' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a secure random token
        const rawToken = uuidv4();

        // Hash the token for storage (using SHA-256)
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // Set expiration to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Check if device token already exists for this user and device
        const existingToken = await prisma.deviceToken.findUnique({
            where: {
                userId_deviceId: {
                    userId: user.id,
                    deviceId: deviceInfo.deviceId,
                },
            },
        });

        let deviceToken;

        if (existingToken) {
            // Update existing token
            deviceToken = await prisma.deviceToken.update({
                where: { id: existingToken.id },
                data: {
                    token: hashedToken,
                    platform: deviceInfo.platform,
                    model: deviceInfo.model || null,
                    osVersion: deviceInfo.osVersion || null,
                    expiresAt,
                    lastUsed: new Date(),
                },
            });
        } else {
            // Create new device token
            deviceToken = await prisma.deviceToken.create({
                data: {
                    userId: user.id,
                    deviceId: deviceInfo.deviceId,
                    token: hashedToken,
                    platform: deviceInfo.platform,
                    model: deviceInfo.model || null,
                    osVersion: deviceInfo.osVersion || null,
                    expiresAt,
                },
            });
        }

        // Return the raw token to the client (only time it's sent unhashed)
        res.json({
            message: 'Device token generated successfully',
            deviceToken: rawToken, // Client stores this
            expiresAt: deviceToken.expiresAt,
        });
    } catch (error) {
        console.error('Generate device token error:', error);
        res.status(500).json({ error: 'Failed to generate device token' });
    }
};

/**
 * Login using biometric authentication (device token)
 */
export const biometricLogin = async (req: Request, res: Response) => {
    try {
        const { deviceToken } = req.body;

        if (!deviceToken) {
            return res.status(400).json({ error: 'Device token is required' });
        }

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(deviceToken)
            .digest('hex');

        // Find the device token
        const storedToken = await prisma.deviceToken.findUnique({
            where: { token: hashedToken },
            include: {
                user: {
                    include: {
                        profiles: true,
                    },
                },
            },
        });

        if (!storedToken) {
            return res.status(401).json({ error: 'Invalid device token' });
        }

        // Check if token has expired
        if (new Date() > storedToken.expiresAt) {
            // Delete expired token
            await prisma.deviceToken.delete({
                where: { id: storedToken.id },
            });
            return res.status(401).json({ error: 'Device token has expired. Please log in again.' });
        }

        // Update last used timestamp
        await prisma.deviceToken.update({
            where: { id: storedToken.id },
            data: { lastUsed: new Date() },
        });

        // Generate a new Firebase custom token for the user
        // This allows the user to authenticate with Firebase services
        const firebaseToken = await admin.auth().createCustomToken(storedToken.user.phoneNumber);

        res.json({
            message: 'Biometric login successful',
            token: firebaseToken,
            user: storedToken.user,
        });
    } catch (error) {
        console.error('Biometric login error:', error);
        res.status(500).json({ error: 'Biometric login failed' });
    }
};

/**
 * List all device tokens for a user
 */
export const listDeviceTokens = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number not found in token' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all device tokens for this user
        const devices = await prisma.deviceToken.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                deviceId: true,
                platform: true,
                model: true,
                osVersion: true,
                lastUsed: true,
                expiresAt: true,
                createdAt: true,
            },
            orderBy: { lastUsed: 'desc' },
        });

        res.json({
            devices,
        });
    } catch (error) {
        console.error('List device tokens error:', error);
        res.status(500).json({ error: 'Failed to list device tokens' });
    }
};

/**
 * Revoke a specific device token
 */
export const revokeDeviceToken = async (req: Request, res: Response) => {
    try {
        const { idToken, deviceId } = req.body;

        if (!idToken || !deviceId) {
            return res.status(400).json({ error: 'ID Token and deviceId are required' });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number not found in token' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the device token
        const deleted = await prisma.deviceToken.deleteMany({
            where: {
                userId: user.id,
                deviceId: deviceId,
            },
        });

        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Device token not found' });
        }

        res.json({
            message: 'Device token revoked successfully',
        });
    } catch (error) {
        console.error('Revoke device token error:', error);
        res.status(500).json({ error: 'Failed to revoke device token' });
    }
};
