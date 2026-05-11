import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { loadEnv } from '../config/env.js';
import { createApp } from '../app.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../..');
config({ path: resolve(repoRoot, '.env') });

beforeAll(() => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ?? 'postgresql://hotel:hotel@localhost:5432/hotel_booking';
  process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/hotel_booking';
  process.env.WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'a'.repeat(32);
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'b'.repeat(32);
  process.env.EMAIL_FROM = 'noreply@example.com';
});

describe('API HTTP (integration)', () => {
  it('GET /health returns ok', async () => {
    const env = loadEnv();
    const app = createApp(env);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
