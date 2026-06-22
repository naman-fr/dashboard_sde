import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import { connectDB } from './config/db';
import v1Router from './routes/v1';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// --------------- Middleware ---------------
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));

// --------------- Health check ---------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- API Routes ---------------
app.use('/api/v1', v1Router);

// --------------- Error Handler ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
async function main(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] Analytics API running on port ${PORT}`);
    console.log(`[Server] CORS origin: ${CORS_ORIGIN}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

main().catch((error) => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
