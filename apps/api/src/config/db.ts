import mongoose from 'mongoose';
import { logger } from '@analytics/shared-utils';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      logger.error('MONGO_URI is not defined in environment variables');
      // We don't exit process here so that local dev without DB still starts,
      // but it will fail on operations.
      return;
    }

    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
