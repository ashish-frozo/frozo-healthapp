import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Twilio client for WhatsApp
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Send WhatsApp message
const sendWhatsApp = async (to: string, message: string) => {
    if (!twilioClient) {
        console.log(`[WhatsApp Mock to ${to}]: ${message}`);
        return;
    }
    try {
        await twilioClient.messages.create({
            from: WHATSAPP_NUMBER,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            body: message,
        });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
    }
};

// Notify all caregivers in a household
export const notifyCaregivers = async (
    householdId: string,
    profileName: string,
    message: string,
    excludeUserId?: string
) => {
    // Get all admins and caregivers in the household
    const caregivers = await prisma.householdMember.findMany({
        where: {
            householdId,
            role: { in: ['admin', 'caregiver'] },
            userId: excludeUserId ? { not: excludeUserId } : undefined,
        },
        include: { user: true },
    });

    for (const caregiver of caregivers) {
        await sendWhatsApp(caregiver.user.phoneNumber, message);
    }

    return caregivers.length;
};

// Trigger SOS emergency alert
export const triggerSOS = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { profileId, latitude, longitude, message } = req.body;

        if (!userId || !profileId) {
            return res.status(400).json({ error: 'User ID and Profile ID required' });
        }

        // Get profile and user details
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                user: true,
                alertSettings: true,
            },
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Create emergency alert record
        const alert = await prisma.emergencyAlert.create({
            data: {
                profileId,
                type: 'sos',
                message: message || 'Emergency SOS triggered!',
                latitude,
                longitude,
            },
        });

        // Build location link if coordinates provided
        const locationLink = latitude && longitude
            ? `https://maps.google.com/maps?q=${latitude},${longitude}`
            : null;

        // Get household for this profile
        const householdMember = await prisma.householdMember.findFirst({
            where: { userId: profile.userId },
            include: { household: true },
        });

        // Format alert message
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        let alertMessage = `🚨 *EMERGENCY SOS ALERT* 🚨\n\n`;
        alertMessage += `${profile.name} ने emergency button दबाया है!\n\n`;
        alertMessage += `📱 Phone: ${profile.user.phoneNumber}\n`;
        alertMessage += `🕐 Time: ${time}\n`;
        if (locationLink) {
            alertMessage += `📍 Location: ${locationLink}\n`;
        }
        if (message) {
            alertMessage += `\n💬 Message: ${message}\n`;
        }
        alertMessage += `\n⚡ Please check on them immediately!`;

        // Notify all caregivers in household
        let notifiedCount = 0;
        if (householdMember) {
            notifiedCount = await notifyCaregivers(
                householdMember.householdId,
                profile.name,
                alertMessage,
                profile.userId
            );
        }

        // Also notify emergency contacts from alert settings
        if (profile.alertSettings?.emergencyContacts) {
            const emergencyContacts = profile.alertSettings.emergencyContacts as { name: string; phone: string }[];
            for (const contact of emergencyContacts) {
                await sendWhatsApp(contact.phone, alertMessage);
                notifiedCount++;
            }
        }

        res.status(201).json({
            alert,
            notifiedCount,
            message: `SOS alert sent to ${notifiedCount} caregivers`,
        });
    } catch (error) {
        console.error('Error triggering SOS:', error);
        res.status(500).json({ error: 'Failed to trigger SOS alert' });
    }
};

// Get emergency alerts for a household
export const getEmergencyAlerts = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { householdId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        // Verify membership
        const membership = await prisma.householdMember.findUnique({
            where: { householdId_userId: { householdId, userId } },
        });

        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this household' });
        }

        // Get profiles in household
        const profiles = await prisma.profile.findMany({
            where: { householdId },
            select: { id: true },
        });

        const profileIds = profiles.map(p => p.id);

        // Get alerts for all profiles in household
        const alerts = await prisma.emergencyAlert.findMany({
            where: {
                profileId: { in: profileIds },
            },
            include: {
                profile: {
                    select: { name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};

// Resolve an emergency alert
export const resolveAlert = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { alertId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const alert = await prisma.emergencyAlert.update({
            where: { id: alertId },
            data: {
                resolved: true,
                resolvedBy: userId,
                resolvedAt: new Date(),
            },
        });

        res.json(alert);
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ error: 'Failed to resolve alert' });
    }
};

// Get alert settings for a profile
export const getAlertSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { profileId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        let settings = await prisma.alertSettings.findUnique({
            where: { profileId },
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.alertSettings.create({
                data: { profileId },
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching alert settings:', error);
        res.status(500).json({ error: 'Failed to fetch alert settings' });
    }
};

// Update alert settings for a profile
export const updateAlertSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { profileId } = req.params;
        const {
            notifyOnHighBP,
            notifyOnLowBP,
            notifyOnHighGlucose,
            notifyOnLowGlucose,
            bpHighSystolic,
            bpHighDiastolic,
            bpLowSystolic,
            bpLowDiastolic,
            glucoseHighThreshold,
            glucoseLowThreshold,
            emergencyContacts,
        } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const settings = await prisma.alertSettings.upsert({
            where: { profileId },
            update: {
                ...(notifyOnHighBP !== undefined && { notifyOnHighBP }),
                ...(notifyOnLowBP !== undefined && { notifyOnLowBP }),
                ...(notifyOnHighGlucose !== undefined && { notifyOnHighGlucose }),
                ...(notifyOnLowGlucose !== undefined && { notifyOnLowGlucose }),
                ...(bpHighSystolic !== undefined && { bpHighSystolic }),
                ...(bpHighDiastolic !== undefined && { bpHighDiastolic }),
                ...(bpLowSystolic !== undefined && { bpLowSystolic }),
                ...(bpLowDiastolic !== undefined && { bpLowDiastolic }),
                ...(glucoseHighThreshold !== undefined && { glucoseHighThreshold }),
                ...(glucoseLowThreshold !== undefined && { glucoseLowThreshold }),
                ...(emergencyContacts !== undefined && { emergencyContacts }),
            },
            create: {
                profileId,
                notifyOnHighBP: notifyOnHighBP ?? true,
                notifyOnLowBP: notifyOnLowBP ?? true,
                notifyOnHighGlucose: notifyOnHighGlucose ?? true,
                notifyOnLowGlucose: notifyOnLowGlucose ?? true,
                bpHighSystolic: bpHighSystolic ?? 140,
                bpHighDiastolic: bpHighDiastolic ?? 90,
                bpLowSystolic: bpLowSystolic ?? 90,
                bpLowDiastolic: bpLowDiastolic ?? 60,
                glucoseHighThreshold: glucoseHighThreshold ?? 180,
                glucoseLowThreshold: glucoseLowThreshold ?? 70,
                emergencyContacts: emergencyContacts ?? [],
            },
        });

        res.json(settings);
    } catch (error) {
        console.error('Error updating alert settings:', error);
        res.status(500).json({ error: 'Failed to update alert settings' });
    }
};
