import { Router } from 'express';
import { getNotifications, markAsRead, addNotification } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for a profile
 *     tags: [Notifications]
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
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Add a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId, title, message, type, priority]
 *             properties:
 *               profileId: { type: 'string' }
 *               title: { type: 'string' }
 *               message: { type: 'string' }
 *               type: { type: 'string' }
 *               priority: { type: 'string' }
 *               actionUrl: { type: 'string' }
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/', addNotification);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read successfully
 */
router.patch('/:id/read', markAsRead);

export default router;
