import express from 'express';
import { Webhook } from 'standardwebhooks';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize webhook verifier
const webhookSecret = process.env.DODO_WEBHOOK_SECRET || '';

/**
 * @swagger
 * /api/webhooks/dodo:
 *   post:
 *     summary: Handle Dodo Payments webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/dodo', express.json(), async (req, res) => {
    try {
        // Verify webhook signature if secret is configured
        if (webhookSecret) {
            const webhook = new Webhook(webhookSecret);
            const webhookHeaders = {
                'webhook-id': req.headers['webhook-id'] as string,
                'webhook-signature': req.headers['webhook-signature'] as string,
                'webhook-timestamp': req.headers['webhook-timestamp'] as string,
            };

            try {
                const payload = JSON.stringify(req.body);
                await webhook.verify(payload, webhookHeaders);
            } catch (verifyError) {
                logger.error({ err: verifyError }, 'Webhook verification failed');
                return res.status(400).json({ error: 'Invalid signature' });
            }
        }

        // Acknowledge receipt immediately
        res.status(200).json({ received: true });

        // Process webhook asynchronously
        processWebhookAsync(req.body).catch((error) => {
            logger.error({ err: error }, 'Async webhook processing failed');
        });
    } catch (error) {
        logger.error({ err: error }, 'Webhook handler failed');
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

interface PaymentData {
    payment_id: string;
    customer: {
        email: string;
        name: string;
    };
    total_amount: number;
    currency: string;
    metadata?: {
        userId?: string;
        packageId?: string;
        credits?: string;
    };
}

interface WebhookPayload {
    type: string;
    payload: {
        data: PaymentData;
    };
}

interface SubscriptionData {
    subscription_id: string;
    customer: {
        email: string;
        name: string;
    };
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancelled_at?: string;
    metadata?: {
        userId?: string;
        planId?: string;
    };
}

interface WebhookPayload {
    type: string;
    data: PaymentData | SubscriptionData;
}

async function processWebhookAsync(rawData: any) {
    // Log full payload for debugging
    logger.info({ rawPayload: JSON.stringify(rawData) }, 'Webhook received - full payload');

    const { type } = rawData;

    // Handle both formats: data.field or payload.data.field
    // Some Dodo webhooks use "data" directly, others use "payload.data"
    const data = rawData.data || rawData.payload?.data || rawData;

    logger.info({ type, dataKeys: Object.keys(data || {}) }, 'Processing webhook event');

    switch (type) {
        case 'payment.succeeded':
            await handlePaymentSucceeded(data as PaymentData);
            break;
        case 'payment.failed':
            await handlePaymentFailed(data as PaymentData);
            break;
        case 'subscription.active':
            await handleSubscriptionActive(data as SubscriptionData);
            break;
        case 'subscription.cancelled':
            await handleSubscriptionCancelled(data as SubscriptionData);
            break;
        case 'subscription.renewed':
            await handleSubscriptionRenewed(data as SubscriptionData);
            break;
        default:
            logger.info({ type }, 'Unhandled webhook event type');
    }
}

async function handlePaymentSucceeded(payment: PaymentData) {
    const { payment_id, metadata } = payment;

    if (!metadata?.userId || !metadata?.credits) {
        logger.warn({ payment_id }, 'Payment succeeded but missing metadata');
        return;
    }

    const userId = metadata.userId;
    const credits = parseInt(metadata.credits, 10);
    const packageId = metadata.packageId;

    if (isNaN(credits) || credits <= 0) {
        logger.error({ payment_id, credits: metadata.credits }, 'Invalid credits value');
        return;
    }

    try {
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

        // Add credits atomically
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
                description: `Purchased ${packageId || 'credits'} - ${credits} credits`,
                referenceId: payment_id,
            },
        });

        logger.info(
            { userId, credits, payment_id, newBalance: updatedWallet.balance },
            'Credits added from payment'
        );
    } catch (error) {
        logger.error({ err: error, userId, payment_id }, 'Failed to add credits from payment');
        throw error;
    }
}

async function handlePaymentFailed(payment: PaymentData) {
    const { payment_id, metadata } = payment;

    logger.warn(
        { payment_id, userId: metadata?.userId },
        'Payment failed - no credits added'
    );

    // Optionally: Send email notification, update UI state, etc.
}

async function handleSubscriptionActive(subscription: SubscriptionData) {
    const { subscription_id, metadata, current_period_start, current_period_end } = subscription;

    if (!metadata?.userId) {
        logger.warn({ subscription_id }, 'Subscription active but missing userId');
        return;
    }

    const userId = metadata.userId;
    const planId = metadata.planId || 'care_plus';

    try {
        // Upsert subscription record
        await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                subscriptionId: subscription_id,
                status: 'active',
                planId,
                currentPeriodStart: new Date(current_period_start),
                currentPeriodEnd: new Date(current_period_end),
            },
            update: {
                subscriptionId: subscription_id,
                status: 'active',
                planId,
                currentPeriodStart: new Date(current_period_start),
                currentPeriodEnd: new Date(current_period_end),
                cancelledAt: null,
            },
        });

        logger.info(
            { userId, subscription_id, planId },
            'Subscription activated successfully'
        );
    } catch (error) {
        logger.error({ err: error, userId, subscription_id }, 'Failed to activate subscription');
        throw error;
    }
}

async function handleSubscriptionCancelled(subscription: SubscriptionData) {
    const { subscription_id, cancelled_at } = subscription;

    try {
        const existingSub = await prisma.subscription.findUnique({
            where: { subscriptionId: subscription_id },
        });

        if (!existingSub) {
            logger.warn({ subscription_id }, 'Subscription cancelled but not found in DB');
            return;
        }

        await prisma.subscription.update({
            where: { subscriptionId: subscription_id },
            data: {
                status: 'cancelled',
                cancelledAt: cancelled_at ? new Date(cancelled_at) : new Date(),
            },
        });

        logger.info(
            { userId: existingSub.userId, subscription_id },
            'Subscription cancelled'
        );
    } catch (error) {
        logger.error({ err: error, subscription_id }, 'Failed to cancel subscription');
        throw error;
    }
}

async function handleSubscriptionRenewed(subscription: SubscriptionData) {
    const { subscription_id, current_period_start, current_period_end } = subscription;

    try {
        const existingSub = await prisma.subscription.findUnique({
            where: { subscriptionId: subscription_id },
        });

        if (!existingSub) {
            logger.warn({ subscription_id }, 'Subscription renewed but not found in DB');
            return;
        }

        await prisma.subscription.update({
            where: { subscriptionId: subscription_id },
            data: {
                status: 'active',
                currentPeriodStart: new Date(current_period_start),
                currentPeriodEnd: new Date(current_period_end),
            },
        });

        logger.info(
            { userId: existingSub.userId, subscription_id },
            'Subscription renewed'
        );
    } catch (error) {
        logger.error({ err: error, subscription_id }, 'Failed to renew subscription');
        throw error;
    }
}

export default router;

