import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { socketService } from './services/socketService';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import healthRoutes from './routes/healthRoutes';
import reminderRoutes from './routes/reminderRoutes';
import documentRoutes from './routes/documentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import clinicLinkRoutes from './routes/clinicLinkRoutes';
import familyRoutes from './routes/familyRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import householdRoutes from './routes/householdRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import creditsRoutes from './routes/creditsRoutes';
import webhookRoutes from './routes/webhookRoutes';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

dotenv.config();

// Early crash logging
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

// Trust proxy for Railway
app.set('trust proxy', 1);

console.log(`🚀 Starting server...`);
console.log(`📅 Time: ${new Date().toISOString()}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`🌍 Node Env: ${process.env.NODE_ENV}`);

// Initialize Socket.io
socketService.init(httpServer);

// Sentry Initialization
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
}

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.kincare.frozo.ai", "wss://api.kincare.frozo.ai"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
        },
    },
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Keep at 1000 to avoid blocking sync during high activity
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-name'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio WhatsApp webhooks

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/documents', documentRoutes);

// Fallback routes for older frontend versions (PWA cache)
app.use('/api/health/documents', documentRoutes);
app.use('/api/health/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clinic-links', clinicLinkRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.status(200).send('KinCare Backend is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health/db', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        logger.error({ err: error }, 'Database health check failed');
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);

    if (process.env.SENTRY_DSN) {
        Sentry.captureException(err);
    }

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
});

const port = Number(PORT);
httpServer.listen(port, '0.0.0.0', () => {
    logger.info(`🚀 Server ready at http://0.0.0.0:${port}`);
    console.log(`🚀 Server ready at http://0.0.0.0:${port}`);
});

export { app, prisma };
