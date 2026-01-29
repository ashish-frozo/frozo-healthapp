import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import { parseHealthMessage, ParsedHealthMessage } from '../services/geminiParser';
import { socketService } from '../services/socketService';

const router = Router();
const prisma = new PrismaClient();

// Twilio client (optional, for sending replies)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

console.log(`[Twilio Init] SID: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'MISSING'}`);
console.log(`[Twilio Init] Number: ${WHATSAPP_NUMBER}`);


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
    const isFasting = context === 'fasting' || context === 'before_food';

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

// Localized messages based on user preference
type Language = 'english' | 'hindi' | 'hinglish';

const messages = {
    bpSaved: {
        english: (emoji: string, sys: number, dia: number, pulse: number | undefined, status: string, time: string, alert: boolean) =>
            `${emoji} *Blood Pressure Saved!*\n\n📊 ${sys}/${dia}${pulse ? ` (Pulse: ${pulse})` : ''} mmHg\n📈 Status: ${status}\n🕐 Time: ${time}\n\n${alert ? `⚡ _Your family has been notified._` : `Great job! 💪`}`,
        hindi: (emoji: string, sys: number, dia: number, pulse: number | undefined, status: string, time: string, alert: boolean) =>
            `${emoji} *ब्लड प्रेशर सेव हो गया!*\n\n📊 ${sys}/${dia}${pulse ? ` (पल्स: ${pulse})` : ''} mmHg\n📈 स्थिति: ${status}\n🕐 समय: ${time}\n\n${alert ? `⚡ _आपके परिवार को सूचित कर दिया गया है।_` : `बहुत अच्छे! 💪`}`,
        hinglish: (emoji: string, sys: number, dia: number, pulse: number | undefined, status: string, time: string, alert: boolean) =>
            `${emoji} *Blood Pressure Saved!*\n\n📊 ${sys}/${dia}${pulse ? ` (Pulse: ${pulse})` : ''} mmHg\n📈 Status: ${status}\n🕐 Time: ${time}\n\n${alert ? `⚡ _आपके परिवार को notify किया गया है।_` : `बहुत बढ़िया! 💪`}`,
    },
    glucoseSaved: {
        english: (emoji: string, value: number, contextLabel: string, status: string, time: string, alert: boolean) =>
            `${emoji} *Sugar Level Saved!*\n\n📊 ${value} mg/dL\n🍽️ ${contextLabel}\n📈 Status: ${status}\n🕐 Time: ${time}\n\n${alert ? `⚡ _Your family has been notified._` : `👍`}`,
        hindi: (emoji: string, value: number, contextLabel: string, status: string, time: string, alert: boolean) =>
            `${emoji} *शुगर लेवल सेव हो गया!*\n\n📊 ${value} mg/dL\n🍽️ ${contextLabel}\n📈 स्थिति: ${status}\n🕐 समय: ${time}\n\n${alert ? `⚡ _आपके परिवार को सूचित कर दिया गया है।_` : `👍`}`,
        hinglish: (emoji: string, value: number, contextLabel: string, status: string, time: string, alert: boolean) =>
            `${emoji} *Sugar Level Saved!*\n\n📊 ${value} mg/dL\n🍽️ ${contextLabel}\n📈 Status: ${status}\n🕐 Time: ${time}\n\n${alert ? `⚡ _आपके परिवार को notify किया गया है।_` : `👍`}`,
    },
    symptomSaved: {
        english: (symptom: string, severity: string, time: string) =>
            `📝 *Symptom Logged!*\n\n🩺 ${symptom}\n📈 Severity: ${severity}\n🕐 Time: ${time}\n\nTake care! 🙏`,
        hindi: (symptom: string, severity: string, time: string) =>
            `📝 *लक्षण दर्ज हो गया!*\n\n🩺 ${symptom}\n📈 गंभीरता: ${severity}\n🕐 समय: ${time}\n\nअपना ख्याल रखें! 🙏`,
        hinglish: (symptom: string, severity: string, time: string) =>
            `📝 *Symptom Logged!*\n\n🩺 ${symptom}\n📈 Severity: ${severity}\n🕐 Time: ${time}\n\nApna khayal rakhein! 🙏`,
    },
    contextLabels: {
        english: { fasting: 'Fasting', after_food: 'After Meal', before_food: 'Before Meal', random: 'Random' },
        hindi: { fasting: 'खाली पेट', after_food: 'खाने के बाद', before_food: 'खाने से पहले', random: 'रैंडम' },
        hinglish: { fasting: 'खाली पेट (Fasting)', after_food: 'खाने के बाद (After Food)', before_food: 'खाने से पहले (Before Food)', random: 'Random' },
    },
    notRegistered: {
        english: `👋 *Welcome to KinCare!*\n\nYour phone number is not registered.\n\nPlease register in the app first:\nhttps://kincare.frozo.ai\n\nAfter registering, you can log readings via WhatsApp!`,
        hindi: `👋 *KinCare में आपका स्वागत है!*\n\nआपका फोन नंबर रजिस्टर्ड नहीं है।\n\ कृपया पहले ऐप में रजिस्टर करें:\nhttps://kincare.frozo.ai\n\nरजिस्टर करने के बाद, आप WhatsApp से रीडिंग्स लॉग कर सकते हैं!`,
        hinglish: `👋 *KinCare में आपका स्वागत है!*\n\nआपका phone number registered नहीं है।\n\nपहले app में register करें:\nhttps://kincare.frozo.ai\n\nRegister करने के बाद, आप WhatsApp से readings log कर सकते हैं!`,
    },
};

// Send WhatsApp reply
const sendReply = async (to: string, message: string) => {
    if (!twilioClient) {
        console.log(`[WhatsApp Mock Reply to ${to}]: ${message}`);
        return;
    }

    // Ensure 'to' is in correct format: whatsapp:+[digits]
    let formattedTo = to.replace(/\s+/g, ''); // Remove all spaces
    if (!formattedTo.startsWith('whatsapp:')) {
        if (!formattedTo.startsWith('+')) {
            formattedTo = `whatsapp:+${formattedTo}`;
        } else {
            formattedTo = `whatsapp:${formattedTo}`;
        }
    }

    try {
        await twilioClient.messages.create({
            from: WHATSAPP_NUMBER,
            to: formattedTo,
            body: message,
        });
    } catch (error) {
        console.error(`Error sending WhatsApp reply to ${formattedTo}:`, error);
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

// Get help message
const getHelpMessage = () => `
🏥 *KinCare Bot*

मैं आपकी health readings track करने में मदद करता हूं!

*BP log करें:*
• "BP 130/85"
• "mera bp 140 over 90 hai"
• "blood pressure 135/88"

*Sugar log करें:*
• "sugar 110 fasting"
• "khali pet sugar 95"
• "khana khane ke baad sugar 140"

*Symptoms बताएं:*
• "feeling dizzy"
• "sir dard ho raha hai"

*Status देखें:*
• "status" या "aaj ka summary"

बस message भेजें, मैं समझ जाऊंगा! 😊
`.trim();

// Twilio webhook endpoint
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const { From, Body } = req.body;

        console.log(`[WhatsApp Webhook] Received from ${From}: ${Body}`);

        if (!From || !Body) {
            return res.status(400).send('Missing From or Body');
        }

        // Extract phone number (remove whatsapp: prefix and all non-digits except +)
        const rawPhone = From.replace('whatsapp:', '').trim();
        const normalizedPhone = rawPhone.startsWith('+') ? rawPhone.replace(/\s+/g, '') : `+${rawPhone.replace(/\s+/g, '')}`;

        console.log(`[WhatsApp Webhook] From: ${normalizedPhone}, Message: ${Body}`);

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: normalizedPhone },
                    { phoneNumber: rawPhone },
                    { phoneNumber: `+${rawPhone}` },
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
            // Default to hinglish for unregistered users
            await sendReply(From, messages.notRegistered.hinglish);
            return res.status(200).send('OK');
        }

        const profile = user.profiles[0];
        const lang = (user.preferredLanguage || 'hinglish') as Language;

        if (!profile) {
            await sendReply(From, `Please complete your profile setup in the KinCare app first.`);
            return res.status(200).send('OK');
        }

        // Parse message using Gemini AI
        const parsed: ParsedHealthMessage = await parseHealthMessage(Body);

        console.log(`[Gemini Parse] Type: ${parsed.type}, Confidence: ${parsed.confidence}, Interpretation: ${parsed.interpretation}`);

        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

        if (parsed.type === 'bp' && parsed.systolic && parsed.diastolic) {
            const { status, emoji, alert } = getBPStatus(parsed.systolic, parsed.diastolic);

            // Save reading
            const bpReading = await prisma.bPReading.create({
                data: {
                    profileId: profile.id,
                    systolic: parsed.systolic,
                    diastolic: parsed.diastolic,
                    pulse: parsed.pulse,
                    status: status.toLowerCase(),
                },
            });

            // Emit real-time event to frontend
            socketService.sendToUser(user.id, 'bp:new', {
                ...bpReading,
                type: 'bp',
            });

            await sendReply(From, messages.bpSaved[lang](emoji, parsed.systolic, parsed.diastolic, parsed.pulse, status, time, alert));

            // Alert admins if concerning
            if (alert && user.householdMemberships[0]) {
                await notifyAdmins(
                    user.householdMemberships[0].householdId,
                    `🚨 *Health Alert*\n\n${profile.name} ने record किया:\nBP: ${parsed.systolic}/${parsed.diastolic} mmHg\nStatus: ${status}\n\nTime: ${time}`,
                    user.id
                );
            }

        } else if (parsed.type === 'glucose' && parsed.glucoseValue) {
            const context = parsed.glucoseContext || 'fasting';
            const { status, emoji, alert } = getGlucoseStatus(parsed.glucoseValue, context);

            // Use localized context labels
            const contextLabel = messages.contextLabels[lang][context as keyof typeof messages.contextLabels.english] || context;

            // Save reading
            const glucoseReading = await prisma.glucoseReading.create({
                data: {
                    profileId: profile.id,
                    value: parsed.glucoseValue,
                    context: context.replace('_', ' '),
                    status: status.toLowerCase(),
                },
            });

            // Emit real-time event to frontend
            socketService.sendToUser(user.id, 'glucose:new', {
                ...glucoseReading,
                type: 'glucose',
            });

            await sendReply(From, messages.glucoseSaved[lang](emoji, parsed.glucoseValue, contextLabel, status, time, alert));

            // Alert admins if concerning
            if (alert && user.householdMemberships[0]) {
                await notifyAdmins(
                    user.householdMemberships[0].householdId,
                    `🚨 *Health Alert*\n\n${profile.name} ने record किया:\nSugar: ${parsed.glucoseValue} mg/dL (${context})\nStatus: ${status}\n\nTime: ${time}`,
                    user.id
                );
            }

        } else if (parsed.type === 'symptom' && parsed.symptom) {
            // Save symptom
            await prisma.symptom.create({
                data: {
                    profileId: profile.id,
                    name: parsed.symptom,
                    severity: parsed.severity || 'moderate',
                },
            });

            await sendReply(From, messages.symptomSaved[lang](parsed.symptom, parsed.severity || 'moderate', time));

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

            let statusMsg = `📊 *आज का Summary*\n\n*${profile.name}*\n\n`;

            if (bpReadings.length > 0) {
                statusMsg += `*Blood Pressure:*\n`;
                bpReadings.forEach(r => {
                    const rTime = new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
                    statusMsg += `• ${r.systolic}/${r.diastolic} - ${rTime}\n`;
                });
                statusMsg += '\n';
            } else {
                statusMsg += `*Blood Pressure:* आज कोई reading नहीं\n\n`;
            }

            if (glucoseReadings.length > 0) {
                statusMsg += `*Sugar:*\n`;
                glucoseReadings.forEach(r => {
                    const rTime = new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
                    statusMsg += `• ${r.value} mg/dL - ${rTime}\n`;
                });
            } else {
                statusMsg += `*Sugar:* आज कोई reading नहीं`;
            }

            await sendReply(From, statusMsg);

        } else if (parsed.type === 'help') {
            await sendReply(From, getHelpMessage());

        } else {
            // Unknown - show help with encouragement
            await sendReply(From,
                `🤔 मैं समझ नहीं पाया...\n\n` +
                `आपने भेजा: "${Body}"\n\n` +
                `*इस तरह try करें:*\n` +
                `• "BP 130/85"\n` +
                `• "sugar 110 fasting"\n` +
                `• "khali pet sugar 95"\n` +
                `• "status"\n\n` +
                `_"help" लिखें full guide के लिए_`
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
