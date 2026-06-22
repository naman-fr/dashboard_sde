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
// Allow multiple origins or wildcard for Vercel preview deployments
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    
    // If CORS_ORIGIN is '*', allow all
    if (CORS_ORIGIN === '*') return callback(null, true);
    
    // Split by comma in case user provided multiple
    const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
