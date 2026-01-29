import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Lazy-load Dodo Payments client to prevent crash when API key is not configured
let _dodoClient: any = null;
const getDodoClient = () => {
    if (!_dodoClient) {
        if (!process.env.DODO_PAYMENTS_API_KEY) {
            throw new Error('DODO_PAYMENTS_API_KEY is not configured. Please add it to your environment variables.');
        }
        const DodoPayments = require('dodopayments').default;
        _dodoClient = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
            environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
        });
    }
    return _dodoClient;
};

// Credit costs for AI features
const CREDIT_COSTS = {
    lab_translation: 2,
    health_insight: 1,
    doctor_brief: 3,
} as const;

// Credit packages available for purchase (one-time)
const CREDIT_PACKAGES = {
    try_it_out: {
        id: 'try_it_out',
        name: 'Try It Out',
        description: 'Perfect for getting started',
        credits: 50,
        price: 299, // in cents
        productId: process.env.DODO_PRODUCT_TRY_IT_OUT || 'prod_try_it_out',
    },
    monthly_care: {
        id: 'monthly_care',
        name: 'Monthly Care',
        description: 'Best for regular health tracking',
        credits: 150,
        price: 799,
        productId: process.env.DODO_PRODUCT_MONTHLY_CARE || 'prod_monthly_care',
        popular: true,
    },
    yearly_care: {
        id: 'yearly_care',
        name: 'Yearly Care',
        description: 'Maximum value for families',
        credits: 500,
        price: 1999,
        productId: process.env.DODO_PRODUCT_YEARLY_CARE || 'prod_yearly_care',
    },
} as const;

// Subscription plan
const SUBSCRIPTION_PLANS = {
    care_plus: {
        id: 'care_plus',
        name: 'Care+',
        description: 'Unlimited AI-powered health insights',
        price: 999, // in cents per month
        productId: process.env.DODO_PRODUCT_CARE_PLUS || 'prod_care_plus_subscription',
        features: [
            'Unlimited health insights',
            'Unlimited lab translations',
            'Unlimited doctor briefs',
            'Priority support',
            'Family sharing (up to 5 profiles)',
        ],
    },
} as const;

type FeatureType = keyof typeof CREDIT_COSTS;

/**
 * @swagger
 * /api/credits/balance:
 *   get:
 *     summary: Get user's credit balance
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current credit balance
 */
router.get('/balance', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get or create wallet
        let wallet = await prisma.userWallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            // Create wallet with default balance for new users
            wallet = await prisma.userWallet.create({
                data: {
                    userId,
                    balance: 10, // Starting credits
                },
            });

            // Record signup bonus transaction
            await prisma.creditTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: 10,
                    type: 'signup',
                    description: 'Welcome bonus credits',
                },
            });
        }

        // Check for active subscription
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        });

        const hasActiveSubscription = subscription?.status === 'active'
            && subscription.currentPeriodEnd > new Date();

        res.json({
            balance: wallet.balance,
            updatedAt: wallet.updatedAt,
            subscription: hasActiveSubscription ? {
                status: 'active',
                planId: subscription?.planId,
                currentPeriodEnd: subscription?.currentPeriodEnd,
            } : null,
            unlimited: hasActiveSubscription, // For easier frontend check
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to get credit balance');
        res.status(500).json({ error: 'Failed to get credit balance' });
    }
});

/**
 * @swagger
 * /api/credits/use:
 *   post:
 *     summary: Use credits for a feature
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature:
 *                 type: string
 *                 enum: [lab_translation, health_insight, doctor_brief]
 *     responses:
 *       200:
 *         description: Credits deducted successfully
 *       402:
 *         description: Insufficient credits
 */
router.post('/use', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { feature } = req.body as { feature: FeatureType };

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!feature || !CREDIT_COSTS[feature]) {
            return res.status(400).json({ error: 'Invalid feature type' });
        }

        const cost = CREDIT_COSTS[feature];

        // Get wallet
        const wallet = await prisma.userWallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        if (wallet.balance < cost) {
            return res.status(402).json({
                error: 'Insufficient credits',
                required: cost,
                balance: wallet.balance,
            });
        }

        // Deduct credits atomically
        const updatedWallet = await prisma.userWallet.update({
            where: { userId },
            data: {
                balance: { decrement: cost },
            },
        });

        // Record transaction
        await prisma.creditTransaction.create({
            data: {
                walletId: wallet.id,
                amount: -cost,
                type: 'usage',
                description: `Used for ${feature.replace('_', ' ')}`,
                referenceId: feature,
            },
        });

        res.json({
            success: true,
            cost,
            newBalance: updatedWallet.balance,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to use credits');
        res.status(500).json({ error: 'Failed to use credits' });
    }
});

/**
 * @swagger
 * /api/credits/history:
 *   get:
 *     summary: Get credit transaction history
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/history', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const wallet = await prisma.userWallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                },
            },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({
            balance: wallet.balance,
            transactions: wallet.transactions,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to get credit history');
        res.status(500).json({ error: 'Failed to get credit history' });
    }
});

/**
 * @swagger
 * /api/credits/check:
 *   post:
 *     summary: Check if user has enough credits for a feature
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credit check result
 */
router.post('/check', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { feature } = req.body as { feature: FeatureType };

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!feature || !CREDIT_COSTS[feature]) {
            return res.status(400).json({ error: 'Invalid feature type' });
        }

        const cost = CREDIT_COSTS[feature];

        const wallet = await prisma.userWallet.findUnique({
            where: { userId },
        });

        const balance = wallet?.balance || 0;
        const hasEnough = balance >= cost;

        res.json({
            hasEnough,
            required: cost,
            balance,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to check credits');
        res.status(500).json({ error: 'Failed to check credits' });
    }
});

/**
 * @swagger
 * /api/credits/costs:
 *   get:
 *     summary: Get credit costs for all features
 *     tags: [Credits]
 *     responses:
 *       200:
 *         description: Credit costs mapping
 */
router.get('/costs', (req, res) => {
    res.json(CREDIT_COSTS);
});

/**
 * @swagger
 * /api/credits/packages:
 *   get:
 *     summary: Get available credit packages for purchase
 *     tags: [Credits]
 *     responses:
 *       200:
 *         description: List of available packages
 */
router.get('/packages', (req, res) => {
    const packages = Object.values(CREDIT_PACKAGES).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        credits: pkg.credits,
        price: pkg.price,
        priceDisplay: `$${(pkg.price / 100).toFixed(2)}`,
        popular: 'popular' in pkg ? pkg.popular : false,
    }));
    res.json(packages);
});

/**
 * @swagger
 * /api/credits/subscriptions:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Credits]
 *     responses:
 *       200:
 *         description: List of available subscription plans
 */
router.get('/subscriptions', (req, res) => {
    const subscriptions = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceDisplay: `$${(plan.price / 100).toFixed(2)}/mo`,
        features: plan.features,
    }));
    res.json(subscriptions);
});

type PackageType = keyof typeof CREDIT_PACKAGES;

/**
 * @swagger
 * /api/credits/purchase:
 *   post:
 *     summary: Initiate credit purchase via Dodo Payments
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: string
 *                 enum: [try_it_out, monthly_care, yearly_care]
 *     responses:
 *       200:
 *         description: Checkout session URL
 */
router.post('/purchase', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const userEmail = req.headers['x-user-email'] as string;
        const userName = req.headers['x-user-name'] as string;
        const { packageId } = req.body as { packageId: PackageType };

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!packageId || !CREDIT_PACKAGES[packageId]) {
            return res.status(400).json({ error: 'Invalid package' });
        }

        const pkg = CREDIT_PACKAGES[packageId];

        // Create Dodo checkout session
        const session = await getDodoClient().checkoutSessions.create({
            product_cart: [
                {
                    product_id: pkg.productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: userEmail || 'customer@example.com',
                name: userName || 'KinCare User',
            },
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/credits/success`,
            metadata: {
                userId,
                packageId,
                credits: pkg.credits.toString(),
            },
        });

        res.json({
            checkoutUrl: session.checkout_url,
            sessionId: session.session_id,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to create checkout session');
        res.status(500).json({ error: 'Failed to initiate purchase' });
    }
});

type SubscriptionType = keyof typeof SUBSCRIPTION_PLANS;

/**
 * @swagger
 * /api/credits/subscribe:
 *   post:
 *     summary: Initiate subscription via Dodo Payments
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *                 enum: [care_plus]
 *     responses:
 *       200:
 *         description: Checkout session URL for subscription
 */
router.post('/subscribe', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const userEmail = req.headers['x-user-email'] as string;
        const userName = req.headers['x-user-name'] as string;
        const { planId } = req.body as { planId: SubscriptionType };

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!planId || !SUBSCRIPTION_PLANS[planId]) {
            return res.status(400).json({ error: 'Invalid subscription plan' });
        }

        const plan = SUBSCRIPTION_PLANS[planId];

        // Create Dodo checkout session for subscription
        const session = await getDodoClient().checkoutSessions.create({
            product_cart: [
                {
                    product_id: plan.productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: userEmail || 'customer@example.com',
                name: userName || 'KinCare User',
            },
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/credits/success?subscription=true`,
            metadata: {
                userId,
                planId,
                type: 'subscription',
            },
        });

        res.json({
            checkoutUrl: session.checkout_url,
            sessionId: session.session_id,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to create subscription session');
        res.status(500).json({ error: 'Failed to initiate subscription' });
    }
});

/**
 * @swagger
 * /api/credits/add:
 *   post:
 *     summary: Add credits to user wallet (internal/webhook use)
 *     tags: [Credits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               credits:
 *                 type: number
 *               paymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Credits added successfully
 */
router.post('/add', async (req, res) => {
    try {
        // Verify internal request (should be called from webhook handler)
        const internalKey = req.headers['x-internal-key'] as string;
        if (internalKey !== process.env.INTERNAL_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId, credits, paymentId, packageId } = req.body;

        if (!userId || !credits || credits <= 0) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Get or create wallet
        let wallet = await prisma.userWallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            wallet = await prisma.userWallet.create({
                data: {
                    userId,
                    balance: 0,
                },
            });
        }

        // Add credits
        const updatedWallet = await prisma.userWallet.update({
            where: { userId },
            data: {
                balance: { increment: credits },
            },
        });

        // Record transaction
        await prisma.creditTransaction.create({
            data: {
                walletId: wallet.id,
                amount: credits,
                type: 'purchase',
                description: `Purchased ${packageId || 'credits'} package`,
                referenceId: paymentId || undefined,
            },
        });

        logger.info({ userId, credits, paymentId }, 'Credits added successfully');

        res.json({
            success: true,
            newBalance: updatedWallet.balance,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to add credits');
        res.status(500).json({ error: 'Failed to add credits' });
    }
});

export default router;
