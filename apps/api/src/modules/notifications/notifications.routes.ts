import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { mongoObjectIdParamSchema } from '@hotel/shared';
import type { Env } from '../../config/env.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { FcmTokenModel } from '../../models/mongo/FcmToken.js';
import { NotificationModel } from '../../models/mongo/Notification.js';
import { routeParam } from '../../utils/routeParams.js';

const fcmTokenBodySchema = z.object({
  token: z.string().min(1).max(4096),
});

export function createNotificationsRouter(env: Env): Router {
  const r = Router();
  r.use(requireAuth(env));

  r.get('/', async (req: Request, res: Response, next) => {
    try {
      const items = await NotificationModel.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  r.post('/push/register', async (req: Request, res: Response, next) => {
    try {
      const body = fcmTokenBodySchema.parse(req.body);
      const userAgent =
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
      await FcmTokenModel.findOneAndUpdate(
        { token: body.token },
        { $set: { userId: req.user!.id, userAgent } },
        { upsert: true, new: true }
      );
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  r.delete('/push/register', async (req: Request, res: Response, next) => {
    try {
      const fromQuery = typeof req.query.token === 'string' ? req.query.token.trim() : '';
      const bodyParsed = fcmTokenBodySchema.safeParse(req.body ?? {});
      const token = fromQuery || (bodyParsed.success ? bodyParsed.data.token : '');
      if (!token) {
        res.status(400).json({ error: 'token required', code: 'VALIDATION' });
        return;
      }
      await FcmTokenModel.deleteOne({ token, userId: req.user!.id });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  r.patch('/:id/read', async (req: Request, res: Response, next) => {
    try {
      const id = mongoObjectIdParamSchema.parse(routeParam(req.params.id, 'id'));
      await NotificationModel.updateOne(
        { _id: id, userId: req.user!.id },
        { $set: { read: true } }
      );
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  r.post('/mark-all-read', async (req: Request, res: Response, next) => {
    try {
      await NotificationModel.updateMany(
        { userId: req.user!.id, read: false },
        { $set: { read: true } }
      );
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return r;
}
