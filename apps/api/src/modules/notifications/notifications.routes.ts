import { Router } from 'express';
import type { Request, Response } from 'express';
import { mongoObjectIdParamSchema } from '@hotel/shared';
import type { Env } from '../../config/env.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { NotificationModel } from '../../models/mongo/Notification.js';
import { routeParam } from '../../utils/routeParams.js';

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
      await NotificationModel.updateMany({ userId: req.user!.id, read: false }, { $set: { read: true } });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return r;
}
