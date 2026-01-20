import { Router } from 'express';
import {
    triggerSOS,
    getEmergencyAlerts,
    resolveAlert,
    getAlertSettings,
    updateAlertSettings,
} from '../controllers/emergencyController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Emergency
 *   description: Emergency SOS and caregiver alert management
 */

/**
 * @swagger
 * /emergency/sos:
 *   post:
 *     summary: Trigger an SOS emergency alert
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId]
 *             properties:
 *               profileId: { type: 'string' }
 *               latitude: { type: 'number' }
 *               longitude: { type: 'number' }
 *               message: { type: 'string' }
 *     responses:
 *       201:
 *         description: SOS alert triggered successfully
 */
router.post('/sos', triggerSOS);

/**
 * @swagger
 * /emergency/alerts/{householdId}:
 *   get:
 *     summary: Get emergency alerts for a household
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of emergency alerts
 */
router.get('/alerts/:householdId', getEmergencyAlerts);

/**
 * @swagger
 * /emergency/alerts/{alertId}/resolve:
 *   post:
 *     summary: Mark an alert as resolved
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert resolved
 */
router.post('/alerts/:alertId/resolve', resolveAlert);

/**
 * @swagger
 * /emergency/settings/{profileId}:
 *   get:
 *     summary: Get alert settings for a profile
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert settings
 */
router.get('/settings/:profileId', getAlertSettings);

/**
 * @swagger
 * /emergency/settings/{profileId}:
 *   put:
 *     summary: Update alert settings for a profile
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifyOnHighBP: { type: 'boolean' }
 *               notifyOnLowBP: { type: 'boolean' }
 *               notifyOnHighGlucose: { type: 'boolean' }
 *               notifyOnLowGlucose: { type: 'boolean' }
 *               bpHighSystolic: { type: 'integer' }
 *               bpHighDiastolic: { type: 'integer' }
 *               bpLowSystolic: { type: 'integer' }
 *               bpLowDiastolic: { type: 'integer' }
 *               glucoseHighThreshold: { type: 'number' }
 *               glucoseLowThreshold: { type: 'number' }
 *               emergencyContacts: { type: 'array' }
 *     responses:
 *       200:
 *         description: Alert settings updated
 */
router.put('/settings/:profileId', updateAlertSettings);

export default router;
