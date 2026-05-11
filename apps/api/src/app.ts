import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import type { Env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestContext } from './middleware/requestContext.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createHotelsRouter } from './modules/hotels/hotels.routes.js';
import { createBookingsRouter } from './modules/bookings/bookings.routes.js';
import { createWishlistRouter } from './modules/wishlist/wishlist.routes.js';
import { createNotificationsRouter } from './modules/notifications/notifications.routes.js';
import { createReviewsRouter } from './modules/reviews/reviews.routes.js';
import { createAdminRouter } from './modules/admin/admin.routes.js';
import { createStripeWebhookRouter } from './modules/webhooks/stripe.webhook.js';
import { createContactRouter } from './modules/contact/contact.routes.js';
import { openApiDocument } from './swagger.js';

export function createApp(env: Env): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(compression());
  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    })
  );

  app.use('/api/v1/webhooks/stripe', createStripeWebhookRouter(env));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(requestContext);
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info({
        requestId: req.requestId,
        userId: req.user?.id,
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ms: Date.now() - start,
      });
    });
    next();
  });

  const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many booking requests', code: 'RATE_LIMIT' },
  });

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many contact submissions', code: 'RATE_LIMIT' },
  });

  app.use('/api/v1/auth', createAuthRouter(env));
  app.use('/api/v1/contact', contactLimiter, createContactRouter(env));
  app.use('/api/v1/hotels', createHotelsRouter());
  app.use('/api/v1/bookings', bookingLimiter, createBookingsRouter(env));
  app.use('/api/v1/wishlist', createWishlistRouter(env));
  app.use('/api/v1/notifications', createNotificationsRouter(env));
  app.use('/api/v1/reviews', createReviewsRouter(env));
  app.use('/api/v1/admin', createAdminRouter(env));

  if (env.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/live', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/ready', async (_req, res) => {
    try {
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
      res.json({ status: 'ok', checks: { database: true } });
    } catch {
      res.status(503).json({ status: 'unavailable', checks: { database: false } });
    }
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
