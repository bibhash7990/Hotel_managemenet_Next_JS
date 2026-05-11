import { addDays, addMinutes } from '../../utils/dates.js';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { signAccessToken } from '../../lib/jwt.js';
import { generateRefreshToken, generateUrlToken, hashOpaqueToken } from '../../lib/tokenHash.js';
import { sendMail } from '../../lib/email.js';
import { writeAuditLog } from '../../lib/audit-log.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../lib/errors.js';
import { verifyGoogleIdToken } from '../../lib/google-verify.js';
import type { Env } from '../../config/env.js';
import type { UserRole } from '@prisma/client';
import type { ChangePasswordInput, UpdateProfileInput } from '@hotel/shared';

const REFRESH_DAYS = 7;
const VERIFY_HOURS = 48;
const RESET_HOURS = 2;

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
};

async function issueSessionForUser(
  env: Env,
  user: { id: string; email: string; name: string; role: UserRole; emailVerified: boolean }
): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: SessionUser;
}> {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashOpaqueToken(refreshToken);
  const expiresAt = addDays(new Date(), REFRESH_DAYS);
  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });
  const { token: accessToken, expiresIn } = signAccessToken(env.JWT_ACCESS_SECRET, {
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  return {
    accessToken,
    expiresIn,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

export async function register(
  env: Env,
  input: { email: string; password: string; name: string }
): Promise<{ message: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }
  const passwordHash = await hashPassword(input.password);
  const verifyToken = generateUrlToken();
  const verifyTokenExp = addMinutes(new Date(), VERIFY_HOURS * 60);
  const email = input.email.toLowerCase();
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name,
      verifyToken,
      verifyTokenExp,
    },
  });
  writeAuditLog({
    actorId: user.id,
    action: 'auth.register',
    resource: user.id,
    metadata: { email: user.email },
  });
  const link = `${env.WEB_ORIGIN}/verify-email?token=${encodeURIComponent(verifyToken)}`;
  const sent = await sendMail(env, {
    to: email,
    subject: 'Verify your email',
    text: `Click to verify: ${link}`,
    html: `<p>Click to verify:</p><p><a href="${link}">${link}</a></p>`,
  });
  if (!sent.delivered) {
    return {
      message:
        'Account created. We could not send the verification email right now — try resend from login or contact support.',
    };
  }
  return { message: 'Registered. Check your email to verify.' };
}

export async function verifyEmail(env: Env, token: string): Promise<{ message: string }> {
  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExp: { gt: new Date() } },
  });
  if (!user) {
    throw new ValidationError('Invalid or expired verification token');
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
  });
  await sendMail(env, {
    to: user.email,
    subject: 'Email verified',
    text: 'Your email has been verified.',
  });
  return { message: 'Email verified' };
}

export async function login(
  env: Env,
  input: { email: string; password: string }
): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: UserRole; emailVerified: boolean };
}> {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }
  if (!user.passwordHash) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError('Invalid credentials');
  }
  return issueSessionForUser(env, user);
}

export async function loginWithGoogle(
  env: Env,
  idToken: string
): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: SessionUser;
}> {
  const google = await verifyGoogleIdToken(idToken, env.GOOGLE_CLIENT_ID);
  if (!google.email_verified) {
    throw new ValidationError('Google email is not verified');
  }
  const email = google.email.toLowerCase();
  const existingByGoogle = await prisma.user.findUnique({ where: { googleSub: google.sub } });
  if (existingByGoogle) {
    return issueSessionForUser(env, existingByGoogle);
  }
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    throw new ConflictError('This email is already registered. Sign in with email and password.');
  }
  const name =
    google.name?.trim() ||
    (email.includes('@') ? email.slice(0, email.indexOf('@')) : email) ||
    'Guest';
  const user = await prisma.user.create({
    data: {
      email,
      googleSub: google.sub,
      name,
      passwordHash: null,
      avatarUrl: google.picture ?? null,
      emailVerified: true,
    },
  });
  writeAuditLog({
    actorId: user.id,
    action: 'auth.register_google',
    resource: user.id,
    metadata: { email: user.email },
  });
  return issueSessionForUser(env, user);
}

export async function refreshSession(
  env: Env,
  refreshToken: string | undefined
): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
  if (!refreshToken) {
    throw new UnauthorizedError('Missing refresh token');
  }
  const tokenHash = hashOpaqueToken(refreshToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing || existing.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  await prisma.refreshToken.delete({ where: { id: existing.id } });
  const newRefresh = generateRefreshToken();
  const newHash = hashOpaqueToken(newRefresh);
  const expiresAt = addDays(new Date(), REFRESH_DAYS);
  await prisma.refreshToken.create({
    data: { tokenHash: newHash, userId: existing.userId, expiresAt },
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: existing.userId } });
  const { token: accessToken, expiresIn } = signAccessToken(env.JWT_ACCESS_SECRET, {
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  return { accessToken, expiresIn, refreshToken: newRefresh };
}

export async function logout(refreshToken: string | undefined): Promise<{ message: string }> {
  if (!refreshToken) return { message: 'Logged out' };
  const tokenHash = hashOpaqueToken(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  return { message: 'Logged out' };
}

export async function forgotPassword(env: Env, email: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return { message: 'If an account exists, reset instructions were sent.' };
  }
  const resetToken = generateUrlToken();
  const resetTokenExp = addMinutes(new Date(), RESET_HOURS * 60);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExp },
  });
  const link = `${env.WEB_ORIGIN}/reset-password?token=${encodeURIComponent(resetToken)}`;
  await sendMail(env, {
    to: user.email,
    subject: 'Reset your password',
    text: `Reset link (expires in ${RESET_HOURS}h): ${link}`,
  });
  return { message: 'If an account exists, reset instructions were sent.' };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ message: string }> {
  const user = await prisma.user.findFirst({
    where: { resetToken: input.token, resetTokenExp: { gt: new Date() } },
  });
  if (!user) {
    throw new ValidationError('Invalid or expired reset token');
  }
  const passwordHash = await hashPassword(input.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExp: null },
  });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  return { message: 'Password updated' };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
  if (Object.keys(data).length === 0) {
    throw new ValidationError('No fields to update');
  }
  return prisma.user.update({
    where: { id: userId },
    data: data as { name?: string; phone?: string | null; avatarUrl?: string | null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  if (!user.passwordHash) {
    throw new ValidationError('Password is not set for this account');
  }
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Current password is incorrect');
  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return { message: 'Password updated' };
}
