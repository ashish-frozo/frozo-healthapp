import { Router } from 'express';
import { getReminders, addReminder, toggleReminder } from '../controllers/reminderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Medication and health reminders
 */

/**
 * @swagger
 * /reminders:
 *   get:
 *     summary: Get reminders for a profile
 *     tags: [Reminders]
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
 *         description: List of reminders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 */
router.get('/', getReminders);

/**
 * @swagger
 * /reminders:
 *   post:
 *     summary: Add a new reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId, title, time]
 *             properties:
 *               profileId: { type: 'string' }
 *               title: { type: 'string' }
 *               description: { type: 'string' }
 *               time: { type: 'string' }
 *     responses:
 *       201:
 *         description: Reminder created successfully
 */
router.post('/', addReminder);

/**
 * @swagger
 * /reminders/{id}/toggle:
 *   patch:
 *     summary: Toggle reminder completion status
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reminder toggled successfully
 */
router.patch('/:id/toggle', toggleReminder);

export default router;
