import { Request, Response } from 'express';
import { prisma } from '../index';
import { notifyCaregivers } from './emergencyController';

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

        // Check alert thresholds and notify caregivers
        await checkBPAlertThresholds(profileId, systolic, diastolic, status);

        res.json(reading);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add BP reading' });
    }
};

// Check BP thresholds and send caregiver alerts
async function checkBPAlertThresholds(profileId: string, systolic: number, diastolic: number, status: string) {
    try {
        // Get profile with alert settings and household
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                user: true,
                alertSettings: true,
            },
        });

        if (!profile || !profile.alertSettings) return;

        const settings = profile.alertSettings;
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        let shouldAlert = false;
        let alertType = '';
        let alertMessage = '';

        // Check high BP
        if (settings.notifyOnHighBP && (systolic >= settings.bpHighSystolic || diastolic >= settings.bpHighDiastolic)) {
            shouldAlert = true;
            alertType = 'high_bp';
            alertMessage = `⚠️ *High BP Alert*\n\n${profile.name} ने record किया:\n📊 BP: ${systolic}/${diastolic} mmHg\n📈 Status: ${status}\n🕐 Time: ${time}\n\n_Please check on them._`;
        }
        // Check low BP
        else if (settings.notifyOnLowBP && (systolic <= settings.bpLowSystolic || diastolic <= settings.bpLowDiastolic)) {
            shouldAlert = true;
            alertType = 'low_bp';
            alertMessage = `⚠️ *Low BP Alert*\n\n${profile.name} ने record किया:\n📊 BP: ${systolic}/${diastolic} mmHg\n📈 Status: ${status}\n🕐 Time: ${time}\n\n_Please check on them._`;
        }

        if (shouldAlert) {
            // Create alert record
            await prisma.emergencyAlert.create({
                data: {
                    profileId,
                    type: alertType,
                    message: alertMessage,
                },
            });

            // Get household and notify
            const householdMember = await prisma.householdMember.findFirst({
                where: { userId: profile.userId },
            });

            if (householdMember) {
                await notifyCaregivers(householdMember.householdId, profile.name, alertMessage, profile.userId);
            }
        }
    } catch (error) {
        console.error('Error checking BP alert thresholds:', error);
    }
}

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

        // Check alert thresholds and notify caregivers
        await checkGlucoseAlertThresholds(profileId, value, context, status);

        res.json(reading);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add glucose reading' });
    }
};

// Check Glucose thresholds and send caregiver alerts
async function checkGlucoseAlertThresholds(profileId: string, value: number, context: string, status: string) {
    try {
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                user: true,
                alertSettings: true,
            },
        });

        if (!profile || !profile.alertSettings) return;

        const settings = profile.alertSettings;
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        let shouldAlert = false;
        let alertType = '';
        let alertMessage = '';

        // Check high glucose
        if (settings.notifyOnHighGlucose && value >= settings.glucoseHighThreshold) {
            shouldAlert = true;
            alertType = 'high_glucose';
            alertMessage = `⚠️ *High Sugar Alert*\n\n${profile.name} ने record किया:\n📊 Sugar: ${value} mg/dL\n🍽️ Context: ${context}\n📈 Status: ${status}\n🕐 Time: ${time}\n\n_Please check on them._`;
        }
        // Check low glucose
        else if (settings.notifyOnLowGlucose && value <= settings.glucoseLowThreshold) {
            shouldAlert = true;
            alertType = 'low_glucose';
            alertMessage = `⚠️ *Low Sugar Alert*\n\n${profile.name} ने record किया:\n📊 Sugar: ${value} mg/dL\n🍽️ Context: ${context}\n📈 Status: ${status}\n🕐 Time: ${time}\n\n_Please check on them._`;
        }

        if (shouldAlert) {
            await prisma.emergencyAlert.create({
                data: {
                    profileId,
                    type: alertType,
                    message: alertMessage,
                },
            });

            const householdMember = await prisma.householdMember.findFirst({
                where: { userId: profile.userId },
            });

            if (householdMember) {
                await notifyCaregivers(householdMember.householdId, profile.name, alertMessage, profile.userId);
            }
        }
    } catch (error) {
        console.error('Error checking glucose alert thresholds:', error);
    }
}

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
