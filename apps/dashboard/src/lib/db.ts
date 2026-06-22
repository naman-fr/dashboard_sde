import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.warn('Please define the MONGO_URI environment variable');
  // We don't throw here to allow build to pass, but connectDB will throw
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing! Please add it to your Vercel Environment Variables.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB Connection Error Details:', e.message);
    if (e.message && e.message.includes('bad auth')) {
      throw new Error('MongoDB Authentication failed. Please check your username and password in MONGO_URI.');
    }
    if (e.message && e.message.includes('querySrv ETIMEOUT')) {
      throw new Error('MongoDB Connection Timed Out. Please ensure your MongoDB Atlas Network Access is set to allow 0.0.0.0/0 (Access from Anywhere) for Vercel deployments.');
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;
