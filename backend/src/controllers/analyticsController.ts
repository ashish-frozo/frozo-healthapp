import { Request, Response } from 'express';
import { prisma } from '../index';
import { startOfDay, subDays, format } from 'date-fns';

export const getTrends = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.params;
        const { days = 7 } = req.query;
        const startDate = subDays(new Date(), Number(days));

        const bpReadings = await prisma.bPReading.findMany({
            where: {
                profileId,
                timestamp: { gte: startDate },
            },
            orderBy: { timestamp: 'asc' },
        });

        const glucoseReadings = await prisma.glucoseReading.findMany({
            where: {
                profileId,
                timestamp: { gte: startDate },
            },
            orderBy: { timestamp: 'asc' },
        });

        // Simple aggregation by day
        const trends: any = {};

        bpReadings.forEach((r: any) => {
            const day = format(r.timestamp, 'yyyy-MM-dd');
            if (!trends[day]) trends[day] = { date: day, bp: [], glucose: [] };
            trends[day].bp.push({ systolic: r.systolic, diastolic: r.diastolic });
        });

        glucoseReadings.forEach((r: any) => {
            const day = format(r.timestamp, 'yyyy-MM-dd');
            if (!trends[day]) trends[day] = { date: day, bp: [], glucose: [] };
            trends[day].glucose.push(r.value);
        });

        // Calculate averages
        const result = Object.values(trends).map((t: any) => ({
            date: t.date,
            avgSystolic: t.bp.length ? Math.round(t.bp.reduce((a: any, b: any) => a + b.systolic, 0) / t.bp.length) : null,
            avgDiastolic: t.bp.length ? Math.round(t.bp.reduce((a: any, b: any) => a + b.diastolic, 0) / t.bp.length) : null,
            avgGlucose: t.glucose.length ? Math.round(t.glucose.reduce((a: any, b: any) => a + b, 0) / t.glucose.length * 10) / 10 : null,
        }));

        res.json(result);
    } catch (error) {
        console.error('Trends Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
};

export const getSafetyNetStatus = async (req: Request, res: Response) => {
    try {
        const { profileId } = req.params;

        // Fetch last 5 readings for anomaly detection
        const recentBP = await prisma.bPReading.findMany({
            where: { profileId },
            take: 5,
            orderBy: { timestamp: 'desc' },
        });

        const recentGlucose = await prisma.glucoseReading.findMany({
            where: { profileId },
            take: 5,
            orderBy: { timestamp: 'desc' },
        });

        const alerts = [];

        // Simple anomaly detection logic
        if (recentBP.length > 0) {
            const latest = recentBP[0];
            if (latest.systolic > 160 || latest.diastolic > 100) {
                alerts.push({
                    type: 'BP_HIGH',
                    severity: 'critical',
                    message: `Critical BP detected: ${latest.systolic}/${latest.diastolic}`,
                    timestamp: latest.timestamp,
                });
            } else if (latest.systolic > 140 || latest.diastolic > 90) {
                alerts.push({
                    type: 'BP_ELEVATED',
                    severity: 'warning',
                    message: `Elevated BP detected: ${latest.systolic}/${latest.diastolic}`,
                    timestamp: latest.timestamp,
                });
            }
        }

        if (recentGlucose.length > 0) {
            const latest = recentGlucose[0];
            if (latest.value > 250) {
                alerts.push({
                    type: 'GLUCOSE_CRITICAL',
                    severity: 'critical',
                    message: `Critical Glucose detected: ${latest.value} mg/dL`,
                    timestamp: latest.timestamp,
                });
            } else if (latest.value > 180) {
                alerts.push({
                    type: 'GLUCOSE_HIGH',
                    severity: 'warning',
                    message: `High Glucose detected: ${latest.value} mg/dL`,
                    timestamp: latest.timestamp,
                });
            }
        }

        res.json({
            status: alerts.some(a => a.severity === 'critical') ? 'critical' : (alerts.length > 0 ? 'warning' : 'stable'),
            alerts,
        });
    } catch (error) {
        console.error('Safety Net Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch safety net status' });
    }
};
