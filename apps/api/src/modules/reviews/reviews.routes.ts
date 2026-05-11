import { Router } from 'express';
import type { Request, Response } from 'express';
import { createReviewSchema } from '@hotel/shared';
import { z } from 'zod';
import { ForbiddenError, ValidationError } from '../../lib/errors.js';
import type { Env } from '../../config/env.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { ReviewModel } from '../../models/mongo/Review.js';
import { prisma } from '../../lib/prisma.js';
import { routeParam } from '../../utils/routeParams.js';

export function createReviewsRouter(env: Env): Router {
  const r = Router();

  r.post('/', requireAuth(env), async (req: Request, res: Response, next) => {
    try {
      const body = createReviewSchema.parse(req.body);
      const booking = await prisma.booking.findUnique({
        where: { id: body.bookingId },
        include: { hotel: true },
      });
      if (!booking || booking.userId !== req.user!.id) {
        throw new ForbiddenError();
      }
      if (booking.status !== 'COMPLETED') {
        throw new ValidationError('You can only review completed stays');
      }
      const doc = await ReviewModel.create({
        bookingId: body.bookingId,
        userId: req.user!.id,
        hotelId: booking.hotelId,
        rating: body.rating,
        title: body.title,
        comment: body.comment,
        images: body.images,
        moderationStatus: 'PENDING',
      });
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  });

  r.get('/hotel/:hotelId', async (req, res, next) => {
    try {
      const hotelId = z.string().cuid().parse(routeParam(req.params.hotelId, 'hotelId'));
      const items = await ReviewModel.find({
        hotelId,
        moderationStatus: 'APPROVED',
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  return r;
}
