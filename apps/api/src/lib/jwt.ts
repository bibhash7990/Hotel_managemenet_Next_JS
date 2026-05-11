import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';

const ACCESS_TTL_SEC = 15 * 60;

export type AccessPayload = {
  sub: string;
  role: UserRole;
  email: string;
};

export function signAccessToken(
  secret: string,
  payload: AccessPayload
): { token: string; expiresIn: number } {
  const token = jwt.sign(payload, secret, { expiresIn: ACCESS_TTL_SEC });
  return { token, expiresIn: ACCESS_TTL_SEC };
}

export function verifyAccessToken(secret: string, token: string): AccessPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token');
  }
  const sub = (decoded as { sub?: string }).sub;
  const role = (decoded as { role?: UserRole }).role;
  const email = (decoded as { email?: string }).email;
  if (!sub || !role || !email) throw new Error('Invalid token payload');
  return { sub, role, email };
}
