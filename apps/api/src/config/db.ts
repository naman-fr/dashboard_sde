import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
    console.log(`[DB] Connected to MongoDB successfully`);
  } catch (error) {
    console.error('[DB] MongoDB connection failed:', error);
    process.exit(1);
  }
}
