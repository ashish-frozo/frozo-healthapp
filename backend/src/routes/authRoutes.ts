import { Router } from 'express';
import { sendOTP, verifyOTP } from '../controllers/authController';
import { getUserSettings, updateUserSettings } from '../controllers/userSettingsController';
import { validateBody } from '../middleware/validate';
import { sendOtpSchema, verifyOtpSchema, updateSettingsSchema } from '../schemas/authSchemas';

const router = Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to a phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Phone number is required
 */
router.post('/send-otp', validateBody(sendOtpSchema), sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid OTP or missing fields
 */
router.post('/verify-otp', validateBody(verifyOtpSchema), verifyOTP);

/**
 * @swagger
 * /auth/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User settings
 *   patch:
 *     summary: Update user settings
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredLanguage:
 *                 type: string
 *                 enum: [english, hindi, hinglish]
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.get('/settings', getUserSettings);
router.patch('/settings', validateBody(updateSettingsSchema), updateUserSettings);

export default router;

