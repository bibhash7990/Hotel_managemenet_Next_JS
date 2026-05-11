import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  bookingListQuerySchema,
  createBookingSchema,
  patchBookingBodySchema,
} from '@hotel/shared';
import type { Env } from '../../config/env.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import * as bookingsService from './bookings.service.js';
import { routeParam } from '../../utils/routeParams.js';

export function createBookingsRouter(env: Env): Router {
  const r = Router();
  r.use(requireAuth(env));

  r.post('/', async (req: Request, res: Response, next) => {
    try {
      const body = createBookingSchema.parse(req.body);
      const booking = await bookingsService.createBooking(req.user!.id, body, env);
      res.status(201).json(booking);
    } catch (e) {
      next(e);
    }
  });

  r.get('/me', async (req: Request, res: Response, next) => {
    try {
      const q = bookingListQuerySchema.parse(req.query);
      const result = await bookingsService.listMyBookings(
        req.user!.id,
        q.page,
        q.limit,
        q.status
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/checkout-session/:sessionId', async (req: Request, res: Response, next) => {
    try {
      const sessionId = z.string().min(10).max(200).parse(routeParam(req.params.sessionId, 'sessionId'));
      const result = await bookingsService.getMyBookingByCheckoutSession(env, req.user!.id, sessionId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/:id/pay', async (req: Request, res: Response, next) => {
    try {
      const result = await bookingsService.createPaymentIntent(
        env,
        req.user!.id,
        z.string().cuid().parse(routeParam(req.params.id))
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/:id/payment-intent', async (req: Request, res: Response, next) => {
    try {
      const result = await bookingsService.createPaymentIntent(
        env,
        req.user!.id,
        z.string().cuid().parse(routeParam(req.params.id))
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/:id/checkout', async (req: Request, res: Response, next) => {
    try {
      const result = await bookingsService.createCheckoutSession(
        env,
        req.user!.id,
        z.string().cuid().parse(routeParam(req.params.id))
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/:id', async (req: Request, res: Response, next) => {
    try {
      const booking = await bookingsService.getMyBooking(
        req.user!.id,
        z.string().cuid().parse(routeParam(req.params.id))
      );
      res.json(booking);
    } catch (e) {
      next(e);
    }
  });

  r.patch('/:id', async (req: Request, res: Response, next) => {
    try {
      const bookingId = z.string().cuid().parse(routeParam(req.params.id));
      const body = patchBookingBodySchema.parse(req.body);
      if (body.action === 'cancel') {
        const booking = await bookingsService.cancelBooking(req.user!.id, bookingId, env);
        res.json(booking);
        return;
      }
      const booking = await bookingsService.modifyMyBooking(req.user!.id, bookingId, body);
      res.json(booking);
    } catch (e) {
      next(e);
    }
  });

  r.patch('/:id/cancel', async (req: Request, res: Response, next) => {
    try {
      const booking = await bookingsService.cancelBooking(
        req.user!.id,
        z.string().cuid().parse(routeParam(req.params.id)),
        env
      );
      res.json(booking);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
