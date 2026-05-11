import { existsSync } from 'fs';
import { createServer } from 'http';
import path from 'path';
import { config as loadDotenv } from 'dotenv';
import { loadEnv } from './config/env.js';
import { createApp } from './app.js';
import { connectMongo } from './lib/mongo.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

function bootstrapEnv(): void {
  const cwdEnv = path.resolve(process.cwd(), '.env');
  const repoRootEnv = path.resolve(process.cwd(), '..', '..', '.env');
  const envPath = existsSync(cwdEnv) ? cwdEnv : repoRootEnv;
  loadDotenv({ path: envPath });
}

/**
 * When NODE_ENV=production, promote `<KEY>_PROD` values into `<KEY>` so a single
 * `.env` file can hold both local and production endpoints. Hosting platforms
 * (Render/Railway/Vercel) can still override either form via their own env UI —
 * platform-provided values win because they're already in process.env before
 * dotenv runs (dotenv does not override existing keys by default).
 */
function applyProdOverrides(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const map: Record<string, string> = {
    DATABASE_URL_PROD: 'DATABASE_URL',
    MONGODB_URI_PROD: 'MONGODB_URI',
    REDIS_URL_PROD: 'REDIS_URL',
    WEB_ORIGIN_PROD: 'WEB_ORIGIN',
    API_URL_PROD: 'API_URL',
    GOOGLE_CLIENT_ID_PROD: 'GOOGLE_CLIENT_ID',
  };
  for (const [src, dst] of Object.entries(map)) {
    const v = process.env[src];
    if (v && v.trim()) process.env[dst] = v.trim();
  }
}

async function main(): Promise<void> {
  bootstrapEnv();
  applyProdOverrides();
  const env = loadEnv();
  if (env.REDIS_URL) process.env.REDIS_URL = env.REDIS_URL;
  if (env.CLOUDINARY_URL) process.env.CLOUDINARY_URL = env.CLOUDINARY_URL;
  await connectMongo(env.MONGODB_URI);
  await prisma.$connect();

  const app = createApp(env);
  const server = createServer(app);
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API listening');
  });
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
