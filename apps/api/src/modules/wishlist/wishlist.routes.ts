import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { Env } from '../../config/env.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { routeParam } from '../../utils/routeParams.js';
import { wishlistListQuerySchema } from '@hotel/shared';

export function createWishlistRouter(env: Env): Router {
  const r = Router();
  r.use(requireAuth(env));

  r.get('/', async (req: Request, res: Response, next) => {
    try {
      const q = wishlistListQuerySchema.parse(req.query);
      const where = { userId: req.user!.id };
      const [total, items] = await Promise.all([
        prisma.wishlist.count({ where }),
        prisma.wishlist.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          include: {
            hotel: {
              select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              country: true,
              images: true,
              starRating: true,
            },
            },
          },
        }),
      ]);
      res.json({ items, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) });
    } catch (e) {
      next(e);
    }
  });

  r.post('/:hotelId', async (req: Request, res: Response, next) => {
    try {
      const hotelId = z.string().cuid().parse(routeParam(req.params.hotelId, 'hotelId'));
      const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) throw new NotFoundError('Hotel not found');
      const existing = await prisma.wishlist.findUnique({
        where: { userId_hotelId: { userId: req.user!.id, hotelId } },
      });
      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        res.json({ saved: false });
        return;
      }
      await prisma.wishlist.create({ data: { userId: req.user!.id, hotelId } });
      res.json({ saved: true });
    } catch (e) {
      next(e);
    }
  });

  return r;
}
