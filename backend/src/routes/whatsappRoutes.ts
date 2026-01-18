import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const router = Router();
const prisma = new PrismaClient();

// Twilio client (optional, for sending replies)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Parse health messages from WhatsApp
const parseHealthMessage = (message: string): {
    type: 'bp' | 'glucose' | 'symptom' | 'status' | 'unknown';
    systolic?: number;
    diastolic?: number;
    value?: number;
    context?: string;
    symptom?: string;
} => {
    const text = message.trim().toLowerCase();

    // BP: "bp 130/85" or "130/85" or "bp 130 85"
    const bpMatch = text.match(/(?:bp\s*)?(\d{2,3})[\/\s](\d{2,3})/);
    if (bpMatch) {
        return {
            type: 'bp',
            systolic: parseInt(bpMatch[1]),
            diastolic: parseInt(bpMatch[2]),
        };
    }

    // Glucose: "sugar 110" or "glucose 140 after food"
    const glucoseMatch = text.match(/(?:sugar|glucose)\s*(\d{2,3})(?:\s*(fasting|after food|before food|random))?/);
    if (glucoseMatch) {
        return {
            type: 'glucose',
            value: parseInt(glucoseMatch[1]),
            context: glucoseMatch[2] || 'fasting',
        };
    }

    // Status check
    if (text === 'status' || text === 'summary' || text === 'today') {
        return { type: 'status' };
    }

    // Symptom (general text)
    if (text.includes('feeling') || text.includes('pain') || text.includes('headache') || text.includes('dizzy')) {
        return {
            type: 'symptom',
            symptom: message.trim(),
        };
    }

    return { type: 'unknown' };
};

// Get BP status
const getBPStatus = (systolic: number, diastolic: number): { status: string; emoji: string; alert: boolean } => {
    if (systolic < 90 || diastolic < 60) {
        return { status: 'Low', emoji: '⚠️', alert: true };
    }
    if (systolic >= 180 || diastolic >= 120) {
        return { status: 'Critical - Seek medical attention!', emoji: '🚨', alert: true };
    }
    if (systolic >= 140 || diastolic >= 90) {
        return { status: 'High', emoji: '⚠️', alert: true };
    }
    if (systolic >= 120 || diastolic >= 80) {
        return { status: 'Elevated', emoji: '📊', alert: false };
    }
    return { status: 'Normal', emoji: '✅', alert: false };
};

// Get Glucose status
const getGlucoseStatus = (value: number, context: string): { status: string; emoji: string; alert: boolean } => {
    const isFasting = context === 'fasting' || context === 'before food';

    if (isFasting) {
        if (value < 70) return { status: 'Low', emoji: '⚠️', alert: true };
        if (value >= 126) return { status: 'High', emoji: '⚠️', alert: true };
        if (value >= 100) return { status: 'Pre-diabetic range', emoji: '📊', alert: false };
        return { status: 'Normal', emoji: '✅', alert: false };
    } else {
        if (value < 70) return { status: 'Low', emoji: '⚠️', alert: true };
        if (value >= 200) return { status: 'High', emoji: '⚠️', alert: true };
        if (value >= 140) return { status: 'Elevated', emoji: '📊', alert: false };
        return { status: 'Normal', emoji: '✅', alert: false };
    }
};

// Send WhatsApp reply
const sendReply = async (to: string, message: string) => {
    if (!twilioClient) {
        console.log(`[WhatsApp Mock Reply to ${to}]: ${message}`);
        return;
    }

    try {
        await twilioClient.messages.create({
            from: WHATSAPP_NUMBER,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            body: message,
        });
    } catch (error) {
        console.error('Error sending WhatsApp reply:', error);
    }
};

// Notify household admins
const notifyAdmins = async (householdId: string, message: string, excludeUserId?: string) => {
    const admins = await prisma.householdMember.findMany({
        where: {
            householdId,
            role: 'admin',
            userId: { not: excludeUserId },
        },
        include: {
            user: true,
        },
    });

    for (const admin of admins) {
        await sendReply(admin.user.phoneNumber, message);
    }
};

// Twilio webhook endpoint
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const { From, Body, ProfileName } = req.body;

        if (!From || !Body) {
            return res.status(400).send('Missing From or Body');
        }

        // Extract phone number (remove whatsapp: prefix)
        const phoneNumber = From.replace('whatsapp:', '').replace('+', '');
        const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

        console.log(`[WhatsApp] From: ${normalizedPhone}, Message: ${Body}`);

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: normalizedPhone },
                    { phoneNumber: phoneNumber },
                    { phoneNumber: `+${phoneNumber}` },
                ],
            },
            include: {
                profiles: {
                    take: 1, // Get primary profile
                },
                householdMemberships: {
                    include: { household: true },
                    take: 1,
                },
            },
        });

        if (!user) {
            await sendReply(From,
                `👋 Welcome to Frozo Health!\n\nYour phone number is not registered yet.\n\nPlease download the app and create an account first:\nhttps://frozo.health\n\nAfter registering, you can log readings directly via WhatsApp!`
            );
            return res.status(200).send('OK');
        }

        const profile = user.profiles[0];
        if (!profile) {
            await sendReply(From, `Please complete your profile setup in the Frozo app first.`);
            return res.status(200).send('OK');
        }

        const parsed = parseHealthMessage(Body);

        if (parsed.type === 'bp' && parsed.systolic && parsed.diastolic) {
            const { status, emoji, alert } = getBPStatus(parsed.systolic, parsed.diastolic);

            // Save reading
            await prisma.bPReading.create({
                data: {
                    profileId: profile.id,
                    systolic: parsed.systolic,
                    diastolic: parsed.diastolic,
                    status: status.toLowerCase(),
                },
            });

            const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

            await sendReply(From,
                `${emoji} *Blood Pressure Saved!*\n\n` +
                `📊 ${parsed.systolic}/${parsed.diastolic} mmHg\n` +
                `📈 Status: ${status}\n` +
                `🕐 Time: ${time}\n\n` +
                (alert ? `_Your family has been notified._` : `Keep up the good work! 💪`)
            );

            // Alert admins if concerning
            if (alert && user.householdMemberships[0]) {
                await notifyAdmins(
                    user.householdMemberships[0].householdId,
                    `🚨 *Health Alert*\n\n${profile.name} just recorded:\nBP: ${parsed.systolic}/${parsed.diastolic} mmHg (${status})\n\nTime: ${time}`,
                    user.id
                );
            }

        } else if (parsed.type === 'glucose' && parsed.value) {
            const context = parsed.context || 'fasting';
            const { status, emoji, alert } = getGlucoseStatus(parsed.value, context);

            // Save reading
            await prisma.glucoseReading.create({
                data: {
                    profileId: profile.id,
                    value: parsed.value,
                    context,
                    status: status.toLowerCase(),
                },
            });

            const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

            await sendReply(From,
                `${emoji} *Glucose Saved!*\n\n` +
                `📊 ${parsed.value} mg/dL\n` +
                `🍽️ Context: ${context}\n` +
                `📈 Status: ${status}\n` +
                `🕐 Time: ${time}`
            );

            // Alert admins if concerning
            if (alert && user.householdMemberships[0]) {
                await notifyAdmins(
                    user.householdMemberships[0].householdId,
                    `🚨 *Health Alert*\n\n${profile.name} just recorded:\nGlucose: ${parsed.value} mg/dL (${status})\nContext: ${context}\n\nTime: ${time}`,
                    user.id
                );
            }

        } else if (parsed.type === 'symptom' && parsed.symptom) {
            // Save symptom
            await prisma.symptom.create({
                data: {
                    profileId: profile.id,
                    name: parsed.symptom,
                    severity: 'moderate',
                },
            });

            await sendReply(From,
                `📝 *Symptom Logged*\n\n"${parsed.symptom}"\n\nIf symptoms persist or worsen, please consult a doctor.`
            );

        } else if (parsed.type === 'status') {
            // Get today's readings
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const bpReadings = await prisma.bPReading.findMany({
                where: {
                    profileId: profile.id,
                    timestamp: { gte: today },
                },
                orderBy: { timestamp: 'desc' },
                take: 3,
            });

            const glucoseReadings = await prisma.glucoseReading.findMany({
                where: {
                    profileId: profile.id,
                    timestamp: { gte: today },
                },
                orderBy: { timestamp: 'desc' },
                take: 3,
            });

            let statusMsg = `📊 *Today's Summary*\n\n*${profile.name}*\n\n`;

            if (bpReadings.length > 0) {
                statusMsg += `*Blood Pressure:*\n`;
                bpReadings.forEach(r => {
                    const time = new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    statusMsg += `• ${r.systolic}/${r.diastolic} at ${time}\n`;
                });
                statusMsg += '\n';
            } else {
                statusMsg += `*Blood Pressure:* No readings today\n\n`;
            }

            if (glucoseReadings.length > 0) {
                statusMsg += `*Glucose:*\n`;
                glucoseReadings.forEach(r => {
                    const time = new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    statusMsg += `• ${r.value} mg/dL at ${time}\n`;
                });
            } else {
                statusMsg += `*Glucose:* No readings today`;
            }

            await sendReply(From, statusMsg);

        } else {
            await sendReply(From,
                `🤔 I didn't understand that.\n\n` +
                `*Try these formats:*\n` +
                `• \`BP 130/85\` - Log blood pressure\n` +
                `• \`Sugar 110\` - Log fasting glucose\n` +
                `• \`Sugar 140 after food\` - Log post-meal glucose\n` +
                `• \`Status\` - See today's readings\n\n` +
                `Or describe any symptoms you're experiencing.`
            );
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.status(500).send('Error processing message');
    }
});

// Twilio webhook verification (GET)
router.get('/webhook', (req: Request, res: Response) => {
    res.status(200).send('WhatsApp webhook is active');
});

export default router;
