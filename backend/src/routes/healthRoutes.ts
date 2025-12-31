import { Router } from 'express';
import {
    getBPReadings, addBPReading,
    getGlucoseReadings, addGlucoseReading,
    getSymptoms, addSymptom
} from '../controllers/healthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health data management (BP, Glucose, Symptoms)
 */

/**
 * @swagger
 * /health/bp:
 *   get:
 *     summary: Get blood pressure readings
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of BP readings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BPReading'
 */
router.get('/bp', getBPReadings);

/**
 * @swagger
 * /health/bp:
 *   post:
 *     summary: Add a blood pressure reading
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId, systolic, diastolic]
 *             properties:
 *               profileId: { type: 'string' }
 *               systolic: { type: 'integer' }
 *               diastolic: { type: 'integer' }
 *               pulse: { type: 'integer' }
 *     responses:
 *       201:
 *         description: Reading added successfully
 */
router.post('/bp', addBPReading);

/**
 * @swagger
 * /health/glucose:
 *   get:
 *     summary: Get glucose readings
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of glucose readings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GlucoseReading'
 */
router.get('/glucose', getGlucoseReadings);

/**
 * @swagger
 * /health/glucose:
 *   post:
 *     summary: Add a glucose reading
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId, value, context]
 *             properties:
 *               profileId: { type: 'string' }
 *               value: { type: 'number' }
 *               context: { type: 'string' }
 *     responses:
 *       201:
 *         description: Reading added successfully
 */
router.post('/glucose', addGlucoseReading);

/**
 * @swagger
 * /health/symptoms:
 *   get:
 *     summary: Get symptoms
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of symptoms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Symptom'
 */
router.get('/symptoms', getSymptoms);

/**
 * @swagger
 * /health/symptoms:
 *   post:
 *     summary: Add a symptom
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId, name, severity]
 *             properties:
 *               profileId: { type: 'string' }
 *               name: { type: 'string' }
 *               severity: { type: 'string' }
 *               notes: { type: 'string' }
 *     responses:
 *       201:
 *         description: Symptom added successfully
 */
router.post('/symptoms', addSymptom);

export default router;
