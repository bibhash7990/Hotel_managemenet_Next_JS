import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    /** Set before any test file imports `prisma` / `createApp` (Prisma reads DATABASE_URL at client init). */
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL ?? 'postgresql://hotel:hotel@localhost:5432/hotel_booking',
      MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/hotel_booking',
      WEB_ORIGIN: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'a'.repeat(32),
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'b'.repeat(32),
      GOOGLE_CLIENT_ID:
        process.env.GOOGLE_CLIENT_ID ??
        '000000000000-testclientidxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      EMAIL_FROM: process.env.EMAIL_FROM ?? 'noreply@example.com',
    },
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 70,
      branches: 60,
      functions: 65,
      statements: 70,
    },
  },
});
