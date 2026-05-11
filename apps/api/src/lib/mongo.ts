import mongoose from 'mongoose';
import type { Env } from '../config/env.js';

let connected = false;

export async function connectMongo(uri: string): Promise<void> {
  if (connected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  connected = true;
}

export function getMongoStatus(): string {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}

export async function disconnectMongo(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

export function mongoUriFromEnv(env: Env): string {
  return env.MONGODB_URI;
}
