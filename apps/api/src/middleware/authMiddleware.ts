import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/jwt.js';
import type { Env } from '../config/env.js';
import type { UserRole } from '@prisma/client';

export function requireAuth(env: Env) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing bearer token'));
      return;
    }
    const token = header.slice('Bearer '.length).trim();
    try {
      const payload = verifyAccessToken(env.JWT_ACCESS_SECRET, token);
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
      next();
    } catch {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  };
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient role'));
      return;
    }
    next();
  };
}
