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

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

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
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
};
app.use(cors(corsOptions));

app.use(express.json());

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/clinic-links', clinicLinkRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', async (req, res) => {
    const startTime = process.hrtime();
    let dbStatus = 'ok';

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
        dbStatus = 'error';
        logger.error({ err: error }, 'Health check: Database connection failed');
    }

    const uptime = process.uptime();
    const [seconds] = process.hrtime(startTime);

    res.json({
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        database: dbStatus,
        responseTime: `${seconds}ms`,
        version: '1.0.0',
    });
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

httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

export { app, prisma };
