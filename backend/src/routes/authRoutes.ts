import { Router } from 'express';
import { sendOTP, verifyOTP, checkUser } from '../controllers/authController';
import {
    generateDeviceToken,
    biometricLogin,
    listDeviceTokens,
    revokeDeviceToken
} from '../controllers/biometricController';
import { getUserSettings, updateUserSettings } from '../controllers/userSettingsController';
import { validateBody } from '../middleware/validate';
import {
    sendOtpSchema,
    verifyOtpSchema,
    updateSettingsSchema,
    generateDeviceTokenSchema,
    biometricLoginSchema,
    listDeviceTokensSchema,
    revokeDeviceTokenSchema,
    checkUserSchema
} from '../schemas/authSchemas';

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
 * /auth/check:
 *   post:
 *     summary: Check if a user exists by phone number
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
 *     responses:
 *       200:
 *         description: Check result
 */
router.post('/check', validateBody(checkUserSchema), checkUser);

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

/**
 * @swagger
 * /auth/device-token:
 *   post:
 *     summary: Generate device token for biometric authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *               - deviceInfo
 *             properties:
 *               idToken:
 *                 type: string
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                   platform:
 *                     type: string
 *                     enum: [android, ios]
 *                   model:
 *                     type: string
 *                   osVersion:
 *                     type: string
 *     responses:
 *       200:
 *         description: Device token generated
 *       400:
 *         description: Invalid request
 */
router.post('/device-token', validateBody(generateDeviceTokenSchema), generateDeviceToken);

/**
 * @swagger
 * /auth/biometric-login:
 *   post:
 *     summary: Login using biometric authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid or expired token
 */
router.post('/biometric-login', validateBody(biometricLoginSchema), biometricLogin);

/**
 * @swagger
 * /auth/devices:
 *   post:
 *     summary: List all device tokens for a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of devices
 */
router.post('/devices', validateBody(listDeviceTokensSchema), listDeviceTokens);

/**
 * @swagger
 * /auth/revoke-device:
 *   post:
 *     summary: Revoke a device token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *               - deviceId
 *             properties:
 *               idToken:
 *                 type: string
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device revoked
 */
router.post('/revoke-device', validateBody(revokeDeviceTokenSchema), revokeDeviceToken);

export default router;

