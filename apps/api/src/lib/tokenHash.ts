import { createHash, randomBytes } from 'crypto';

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateUrlToken(): string {
  return randomBytes(32).toString('base64url');
}
