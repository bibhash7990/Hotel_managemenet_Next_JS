import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

vi.mock('../../lib/google-verify.js', () => ({
  verifyGoogleIdToken: vi.fn(),
}));

import request from 'supertest';
import { loadEnv } from '../../config/env.js';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../lib/password.js';
import * as googleVerify from '../../lib/google-verify.js';

const DOMAIN = 'googleauthtest.invalid';

describe('POST /api/v1/auth/google', () => {
  const env = loadEnv();
  const app = createApp(env);

  beforeEach(() => {
    vi.mocked(googleVerify.verifyGoogleIdToken).mockReset();
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { endsWith: `@${DOMAIN}` } } },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: `@${DOMAIN}` } },
    });
  });

  it('creates a new user and returns tokens', async () => {
    const email = `new-${Date.now()}@${DOMAIN}`;
    vi.mocked(googleVerify.verifyGoogleIdToken).mockResolvedValue({
      sub: `sub-${Date.now()}`,
      email,
      email_verified: true,
      name: 'Google Tester',
    });
    const idToken = 'x'.repeat(120);
    const res = await request(app).post('/api/v1/auth/google').send({ idToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(email.toLowerCase());
  });

  it('logs in existing user by googleSub', async () => {
    const email = `returning-${Date.now()}@${DOMAIN}`;
    const sub = `returning-sub-${Date.now()}`;
    vi.mocked(googleVerify.verifyGoogleIdToken).mockResolvedValue({
      sub,
      email,
      email_verified: true,
    });
    const idToken = 'y'.repeat(120);
    const first = await request(app).post('/api/v1/auth/google').send({ idToken });
    expect(first.status).toBe(200);
    const userId = first.body.user.id;

    vi.mocked(googleVerify.verifyGoogleIdToken).mockResolvedValue({
      sub,
      email,
      email_verified: true,
    });
    const second = await request(app).post('/api/v1/auth/google').send({ idToken });
    expect(second.status).toBe(200);
    expect(second.body.user.id).toBe(userId);
  });

  it('returns 409 when email exists with password account', async () => {
    const email = `collision-${Date.now()}@${DOMAIN}`;
    const hash = await hashPassword('Password123!');
    await prisma.user.create({
      data: {
        email,
        name: 'Collision',
        passwordHash: hash,
        emailVerified: true,
      },
    });
    vi.mocked(googleVerify.verifyGoogleIdToken).mockResolvedValue({
      sub: `other-sub-${Date.now()}`,
      email,
      email_verified: true,
    });
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'z'.repeat(120) });
    expect(res.status).toBe(409);
    await prisma.user.delete({ where: { email } });
  });
});
