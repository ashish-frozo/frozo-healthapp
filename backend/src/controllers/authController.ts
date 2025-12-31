import { Request, Response } from 'express';
import { prisma } from '../index';

// Mock OTP storage (in production, use Redis or a DB)
const otpStore = new Map<string, string>();

export const sendOTP = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Generate a mock OTP (always 123456 for demo)
        const otp = '123456';
        otpStore.set(phoneNumber, otp);

        console.log(`[MOCK OTP] Sent ${otp} to ${phoneNumber}`);

        res.json({ message: 'OTP sent successfully (Mock: 123456)' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        const savedOTP = otpStore.get(phoneNumber);

        if (savedOTP !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Clear OTP after verification
        otpStore.delete(phoneNumber);

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

        // In production, generate a JWT here
        const token = 'mock-jwt-token';

        res.json({
            message: 'OTP verified successfully',
            token,
            user,
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};
