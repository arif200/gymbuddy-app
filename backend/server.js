import app from './src/app.ts';
import { connectDB, closeDB } from './src/db/client.ts';
import { env } from './src/config/env.ts';
import { logger } from './src/utils/logger.ts';
import fs from 'fs';
import path from 'path';

async function start() {
    // Ensure uploads/profiles directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
        await connectDB();
    } catch (err) {
        logger.warn('[SERVER] Database connection failed — server will start anyway');
    }

    const server = app.listen(env.PORT, () => {
        logger.info(`[SERVER] GymBuddy API running on port ${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = async (signal) => {
        logger.info({ signal }, '[SERVER] Shutting down gracefully...');
        server.close();
        await closeDB();
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
