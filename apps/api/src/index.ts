import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from '@analytics/shared-utils';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(compression());
app.use(express.json({ limit: '100kb' })); // Protect against large payloads

// Rate limiting for events ingestion
const ingestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/events', ingestLimiter);
app.use('/api/v1', v1Routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
