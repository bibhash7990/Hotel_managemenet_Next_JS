import { Router } from 'express';
import { availabilityQuerySchema, hotelListQuerySchema, hotelSlugParamSchema } from '@hotel/shared';
import { z } from 'zod';
import * as hotelsService from './hotels.service.js';
import * as availabilityService from './availability.service.js';
import { routeParam } from '../../utils/routeParams.js';
import { NotFoundError } from '../../lib/errors.js';

const roomIdParamSchema = z.string().cuid();

export function createHotelsRouter(): Router {
  const r = Router();

  r.get('/', async (req, res, next) => {
    try {
      const query = hotelListQuerySchema.parse(req.query);
      const result = await hotelsService.listHotels(query);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/:slug/rooms/:roomId', async (req, res, next) => {
    try {
      const slug = hotelSlugParamSchema.parse(routeParam(req.params.slug, 'slug'));
      const roomId = roomIdParamSchema.parse(routeParam(req.params.roomId, 'roomId'));
      const data = await hotelsService.getHotelRoomBySlug(slug, roomId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });

  r.get('/:slug/calendar', async (req, res, next) => {
    try {
      const slug = hotelSlugParamSchema.parse(routeParam(req.params.slug, 'slug'));
      const hotel = await hotelsService.getHotelBySlug(slug);
      const defaultRoomId = hotel.rooms[0]?.id;
      const roomId = req.query.roomId
        ? z.string().cuid().parse(String(req.query.roomId))
        : defaultRoomId;
      if (!roomId) throw new NotFoundError('No rooms available for calendar');
      const startStr = z.string().min(8).max(12).parse(String(req.query.start ?? new Date().toISOString().slice(0, 10)));
      const nights = z.coerce.number().int().min(1).max(90).default(42).parse(req.query.nights ?? '42');
      const start = new Date(`${startStr}T00:00:00.000Z`);
      const result = await availabilityService.roomNightCalendar(slug, roomId, start, nights);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/:slug/availability', async (req, res, next) => {
    try {
      const slug = hotelSlugParamSchema.parse(routeParam(req.params.slug, 'slug'));
      const q = availabilityQuerySchema.parse({
        ...req.query,
        checkIn: req.query.checkIn,
        checkOut: req.query.checkOut,
        guests: req.query.guests,
      });
      const result = await availabilityService.availabilityForSlug(
        slug,
        new Date(q.checkIn),
        new Date(q.checkOut),
        q.guests
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get('/:slug', async (req, res, next) => {
    try {
      const slug = hotelSlugParamSchema.parse(routeParam(req.params.slug, 'slug'));
      const hotel = await hotelsService.getHotelBySlug(slug);
      res.json(hotel);
    } catch (e) {
      next(e);
    }
  });

  return r;
}
