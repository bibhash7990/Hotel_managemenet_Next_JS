import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION',
      details: err.flatten(),
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
    });
    return;
  }
  logger.error({ err }, 'Unhandled error');
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message;
  res.status(500).json({ error: message, code: 'INTERNAL' });
}
