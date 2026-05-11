import { Router } from 'express';
import type { CookieOptions, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailQuerySchema,
} from '@hotel/shared';
import type { Env } from '../../config/env.js';
import { UnauthorizedError } from '../../lib/errors.js';
import { writeAuditLog } from '../../lib/audit-log.js';
import * as authService from './auth.service.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts', code: 'RATE_LIMIT' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts', code: 'RATE_LIMIT' },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts', code: 'RATE_LIMIT' },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests', code: 'RATE_LIMIT' },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reset attempts', code: 'RATE_LIMIT' },
});

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts', code: 'RATE_LIMIT' },
});

function refreshCookieOptions(env: Env): CookieOptions {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function createAuthRouter(env: Env): Router {
  const r = Router();

  r.post('/register', registerLimiter, async (req, res, next) => {
    try {
      const body = registerSchema.parse(req.body);
      const result = await authService.register(env, body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(env, body);
      res.cookie('refresh_token', result.refreshToken, refreshCookieOptions(env));
      writeAuditLog({
        actorId: result.user.id,
        action: 'auth.login',
        resource: result.user.id,
        metadata: { email: result.user.email },
        ip: req.ip,
      });
      res.json({
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user,
      });
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        const email = typeof (req.body as { email?: unknown }).email === 'string' ? (req.body as { email: string }).email : undefined;
        writeAuditLog({
          action: 'auth.login_failed',
          resource: 'user',
          metadata: { email },
          ip: req.ip,
        });
      }
      next(e);
    }
  });

  r.post('/refresh', refreshLimiter, async (req, res, next) => {
    try {
      const token = req.cookies?.refresh_token as string | undefined;
      const result = await authService.refreshSession(env, token);
      res.cookie('refresh_token', result.refreshToken, refreshCookieOptions(env));
      res.json({ accessToken: result.accessToken, expiresIn: result.expiresIn });
    } catch (e) {
      next(e);
    }
  });

  r.post('/logout', async (req, res, next) => {
    try {
      const token = req.cookies?.refresh_token as string | undefined;
      await authService.logout(token);
      res.clearCookie('refresh_token', { path: '/' });
      res.json({ message: 'Logged out' });
    } catch (e) {
      next(e);
    }
  });

  r.get('/verify-email', verifyEmailLimiter, async (req, res, next) => {
    try {
      const q = verifyEmailQuerySchema.parse(req.query);
      const result = await authService.verifyEmail(env, q.token);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/forgot-password', forgotPasswordLimiter, async (req, res, next) => {
    try {
      const body = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(env, body.email);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/reset-password', resetPasswordLimiter, async (req, res, next) => {
    try {
      const body = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/me', requireAuth(env), async (req: Request, res: Response, next) => {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  r.patch('/me', requireAuth(env), async (req: Request, res: Response, next) => {
    try {
      const body = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.user!.id, body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  r.patch('/me/password', requireAuth(env), async (req: Request, res: Response, next) => {
    try {
      const body = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(req.user!.id, body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
