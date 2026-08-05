import mongoose from 'mongoose';
import { logger } from '@leadpilot/lib';

let isConnected = false;
let connectionUri = '';

export async function connectDB(uri?: string): Promise<void> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/leadpilot';

  if (isConnected && connectionUri === mongoUri) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    connectionUri = mongoUri;
    logger.info('✅ MongoDB connected', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { error: String(error) });
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export function getConnectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

export { mongoose };
