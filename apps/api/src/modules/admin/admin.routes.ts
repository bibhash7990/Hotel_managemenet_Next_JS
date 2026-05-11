import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  adminBookingsListQuerySchema,
  adminCustomersListQuerySchema,
  adminReportExportQuerySchema,
  adminRoomsListQuerySchema,
  createHotelSchema,
  createRoomSchema,
  moderateReviewSchema,
  mongoObjectIdParamSchema,
  siteSettingsBulkSchema,
  updateHotelSchema,
  updateRoomSchema,
} from '@hotel/shared';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../lib/errors.js';
import type { Env } from '../../config/env.js';
import { requireAuth, requireRoles } from '../../middleware/authMiddleware.js';
import { slugify } from '../../utils/slug.js';
import { routeParam } from '../../utils/routeParams.js';
import { ReviewModel } from '../../models/mongo/Review.js';
import { buildBookingsReportPdf } from './reports-pdf.js';
import { writeAuditLog } from '../../lib/audit-log.js';
import { refundBookingAsAdmin } from './admin-bookings.service.js';
import { v2 as cloudinary } from 'cloudinary';

const bookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export function createAdminRouter(env: Env): Router {
  const r = Router();
  r.use(requireAuth(env));
  r.use(requireRoles('SUPER_ADMIN', 'HOTEL_MANAGER'));

  // Prompt 1: GET /api/v1/admin/dashboard/kpis
  r.get('/dashboard/kpis', async (req: Request, res: Response, next) => {
    try {
      const ownerFilter =
        req.user!.role === 'SUPER_ADMIN'
          ? {}
          : { ownerId: req.user!.id };

      const [bookingCount, revenueAgg, hotels] = await Promise.all([
        prisma.booking.count({
          where: {
            hotel: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : undefined,
          },
        }),
        prisma.booking.aggregate({
          where: {
            status: 'CONFIRMED',
            hotel: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : undefined,
          },
          _sum: { totalPrice: true },
        }),
        prisma.hotel.count({
          where: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : {},
        }),
      ]);

      res.json({
        totalBookings: bookingCount,
        revenue: revenueAgg._sum.totalPrice?.toString() ?? '0',
        hotelCount: hotels,
      });
    } catch (e) {
      next(e);
    }
  });

  // Backward-compatible alias (earlier implementation name)
  r.get('/dashboard', async (req: Request, res: Response, next) => {
    try {
      const ownerFilter =
        req.user!.role === 'SUPER_ADMIN'
          ? {}
          : { ownerId: req.user!.id };

      const [bookingCount, revenueAgg, hotels] = await Promise.all([
        prisma.booking.count({
          where: {
            hotel: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : undefined,
          },
        }),
        prisma.booking.aggregate({
          where: {
            status: 'CONFIRMED',
            hotel: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : undefined,
          },
          _sum: { totalPrice: true },
        }),
        prisma.hotel.count({
          where: ownerFilter.ownerId ? { ownerId: ownerFilter.ownerId } : {},
        }),
      ]);

      res.json({
        totalBookings: bookingCount,
        revenue: revenueAgg._sum.totalPrice?.toString() ?? '0',
        hotelCount: hotels,
      });
    } catch (e) {
      next(e);
    }
  });

  r.get('/hotels', async (req: Request, res: Response, next) => {
    try {
      const where =
        req.user!.role === 'SUPER_ADMIN' ? {} : { ownerId: req.user!.id };
      const items = await prisma.hotel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { rooms: true } } },
      });
      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  // Prompt 1 expects CRUD. Add DELETE.
  r.delete('/hotels/:id', async (req: Request, res: Response, next) => {
    try {
      const hotelId = z.string().cuid().parse(routeParam(req.params.id));
      const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) throw new NotFoundError();
      if (req.user!.role !== 'SUPER_ADMIN' && hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      await prisma.hotel.delete({ where: { id: hotelId } });
      res.json({ deleted: true });
    } catch (e) {
      next(e);
    }
  });

  r.post('/hotels', async (req: Request, res: Response, next) => {
    try {
      const body = createHotelSchema.parse(req.body);
      const slug = slugify(body.name);
      const hotel = await prisma.hotel.create({
        data: {
          ownerId: req.user!.id,
          name: body.name,
          slug,
          description: body.description,
          address: body.address,
          city: body.city,
          country: body.country,
          lat: body.lat,
          lng: body.lng,
          starRating: body.starRating,
          amenities: body.amenities,
          images: body.images,
          status: 'ACTIVE',
        },
      });
      writeAuditLog({
        actorId: req.user!.id,
        action: 'admin.hotel_create',
        resource: hotel.id,
        metadata: { slug: hotel.slug },
        ip: req.ip,
      });
      res.status(201).json(hotel);
    } catch (e) {
      next(e);
    }
  });

  r.patch('/hotels/:id', async (req: Request, res: Response, next) => {
    try {
      const body = updateHotelSchema.parse(req.body);
      const hotel = await prisma.hotel.findUnique({
        where: { id: z.string().cuid().parse(routeParam(req.params.id)) },
      });
      if (!hotel) throw new NotFoundError();
      if (req.user!.role !== 'SUPER_ADMIN' && hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      const data = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined)
      ) as Prisma.HotelUpdateInput;
      if (Object.keys(data).length === 0) {
        throw new ValidationError('No fields to update');
      }
      const updated = await prisma.hotel.update({
        where: { id: hotel.id },
        data,
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  r.post('/rooms', async (req: Request, res: Response, next) => {
    try {
      const body = createRoomSchema.parse(req.body);
      const hotel = await prisma.hotel.findUnique({ where: { id: body.hotelId } });
      if (!hotel) throw new NotFoundError('Hotel not found');
      if (req.user!.role !== 'SUPER_ADMIN' && hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      const room = await prisma.room.create({
        data: {
          hotelId: body.hotelId,
          name: body.name,
          type: body.type,
          description: body.description,
          pricePerNight: body.pricePerNight,
          capacity: body.capacity,
          beds: body.beds,
          amenities: body.amenities,
          images: body.images,
          totalQuantity: body.totalQuantity,
        },
      });
      writeAuditLog({
        actorId: req.user!.id,
        action: 'admin.room_create',
        resource: room.id,
        metadata: { hotelId: room.hotelId },
        ip: req.ip,
      });
      res.status(201).json(room);
    } catch (e) {
      next(e);
    }
  });

  // Prompt 1 expects CRUD. Add GET + DELETE for rooms.
  r.get('/rooms', async (req: Request, res: Response, next) => {
    try {
      const q = adminRoomsListQuerySchema.parse(req.query);
      const { page, limit, hotelId } = q;

      const hotelWhere =
        req.user!.role === 'SUPER_ADMIN'
          ? (hotelId ? { id: hotelId } : undefined)
          : {
              ownerId: req.user!.id,
              ...(hotelId ? { id: hotelId } : {}),
            };

      const hotelIds =
        hotelWhere
          ? (
              await prisma.hotel.findMany({
                where: hotelWhere,
                select: { id: true },
              })
            ).map((x) => x.id)
          : [];

      const where = req.user!.role === 'SUPER_ADMIN'
        ? (hotelId ? { hotelId } : {})
        : { hotelId: { in: hotelIds } };

      const [total, items] = await Promise.all([
        prisma.room.count({ where }),
        prisma.room.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { hotel: { select: { id: true, name: true, slug: true } } },
        }),
      ]);

      res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (e) {
      next(e);
    }
  });

  r.patch('/rooms/:id', async (req: Request, res: Response, next) => {
    try {
      const body = updateRoomSchema.parse(req.body);
      const room = await prisma.room.findUnique({
        where: { id: z.string().cuid().parse(routeParam(req.params.id)) },
        include: { hotel: true },
      });
      if (!room) throw new NotFoundError();
      if (req.user!.role !== 'SUPER_ADMIN' && room.hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      const updated = await prisma.room.update({
        where: { id: room.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.type !== undefined ? { type: body.type } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.pricePerNight !== undefined ? { pricePerNight: body.pricePerNight } : {}),
          ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
          ...(body.beds !== undefined ? { beds: body.beds } : {}),
          ...(body.amenities ? { amenities: body.amenities } : {}),
          ...(body.images ? { images: body.images } : {}),
          ...(body.totalQuantity !== undefined ? { totalQuantity: body.totalQuantity } : {}),
        },
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  r.delete('/rooms/:id', async (req: Request, res: Response, next) => {
    try {
      const roomId = z.string().cuid().parse(routeParam(req.params.id));
      const room = await prisma.room.findUnique({ where: { id: roomId }, include: { hotel: true } });
      if (!room) throw new NotFoundError();
      if (req.user!.role !== 'SUPER_ADMIN' && room.hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      await prisma.room.delete({ where: { id: roomId } });
      res.json({ deleted: true });
    } catch (e) {
      next(e);
    }
  });

  r.get('/bookings', async (req: Request, res: Response, next) => {
    try {
      const { page, limit } = adminBookingsListQuerySchema.parse(req.query);
      const where =
        req.user!.role === 'SUPER_ADMIN'
          ? {}
          : { hotel: { ownerId: req.user!.id } };
      const [total, items] = await Promise.all([
        prisma.booking.count({ where }),
        prisma.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { id: true, email: true, name: true } },
            hotel: { select: { id: true, name: true, slug: true } },
            room: { select: { id: true, name: true } },
          },
        }),
      ]);
      res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (e) {
      next(e);
    }
  });

  r.patch('/bookings/:id', async (req: Request, res: Response, next) => {
    try {
      const body = bookingStatusSchema.parse(req.body);
      const booking = await prisma.booking.findUnique({
        where: { id: z.string().cuid().parse(routeParam(req.params.id)) },
        include: { hotel: true },
      });
      if (!booking) throw new NotFoundError();
      if (req.user!.role !== 'SUPER_ADMIN' && booking.hotel.ownerId !== req.user!.id) {
        throw new ForbiddenError();
      }
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: { status: body.status },
      });
      writeAuditLog({
        actorId: req.user!.id,
        action: 'admin.booking_status',
        resource: booking.id,
        metadata: { status: body.status },
        ip: req.ip,
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  });

  r.post('/bookings/:id/refund', async (req: Request, res: Response, next) => {
    try {
      const bookingId = z.string().cuid().parse(routeParam(req.params.id));
      const result = await refundBookingAsAdmin(env, { id: req.user!.id, role: req.user!.role }, bookingId);
      writeAuditLog({
        actorId: req.user!.id,
        action: 'admin.booking_refund',
        resource: bookingId,
        metadata: { refundId: result.refundId },
        ip: req.ip,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.post('/uploads/image', async (req: Request, res: Response, next) => {
    try {
      if (!env.CLOUDINARY_URL) {
        res.status(503).json({ error: 'Cloudinary not configured (set CLOUDINARY_URL)' });
        return;
      }
      const body = z.object({ dataUrl: z.string().min(20).max(10_000_000) }).parse(req.body);
      if (!body.dataUrl.startsWith('data:image/')) {
        throw new ValidationError('Expected data:image/*;base64,... payload');
      }
      process.env.CLOUDINARY_URL = env.CLOUDINARY_URL;
      cloudinary.config(true);
      const uploaded = await cloudinary.uploader.upload(body.dataUrl, { folder: 'stayhub' });
      writeAuditLog({
        actorId: req.user!.id,
        action: 'admin.image_upload',
        resource: 'cloudinary',
        metadata: { publicId: uploaded.public_id },
        ip: req.ip,
      });
      res.status(201).json({ url: uploaded.secure_url });
    } catch (e) {
      next(e);
    }
  });

  // Prompt 1: GET /api/v1/admin/reviews (moderation queue)
  r.get('/reviews', async (req: Request, res: Response, next) => {
    try {
      const whereFilter: Record<string, unknown> = {};
      if (req.user!.role !== 'SUPER_ADMIN') {
        const hotelIds = (await prisma.hotel.findMany({
          where: { ownerId: req.user!.id },
          select: { id: true },
        })).map((x) => x.id);
        whereFilter.hotelId = { $in: hotelIds };
      }

      const items = await ReviewModel.find({
        ...whereFilter,
        moderationStatus: 'PENDING',
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json({ items });
    } catch (e) {
      next(e);
    }
  });

  // Prompt 1: PATCH /api/v1/admin/reviews/:id (approve/reject)
  r.patch('/reviews/:id', async (req: Request, res: Response, next) => {
    try {
      const body = moderateReviewSchema.parse(req.body);
      const reviewId = mongoObjectIdParamSchema.parse(routeParam(req.params.id, 'id'));
      const review = await ReviewModel.findById(reviewId);
      if (!review) throw new NotFoundError('Review not found');

      if (req.user!.role !== 'SUPER_ADMIN') {
        const hotel = await prisma.hotel.findFirst({
          where: { id: review.hotelId, ownerId: req.user!.id },
        });
        if (!hotel) throw new ForbiddenError();
      }

      review.moderationStatus = body.moderationStatus;
      await review.save();
      res.json(review);
    } catch (e) {
      next(e);
    }
  });

  // GET /api/v1/admin/reports/export — CSV or PDF
  r.get('/reports/export', async (req: Request, res: Response, next) => {
    try {
      const q = adminReportExportQuerySchema.parse(req.query);
      const csvHeaders = [
        'bookingId',
        'status',
        'totalPrice',
        'checkIn',
        'checkOut',
        'guests',
        'userEmail',
        'hotelName',
        'roomName',
        'createdAt',
      ];

      const where =
        req.user!.role === 'SUPER_ADMIN'
          ? {}
          : { hotel: { ownerId: req.user!.id } };

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: q.limit,
        include: {
          user: { select: { email: true } },
          hotel: { select: { name: true } },
          room: { select: { name: true } },
        },
      });

      const csvRows = bookings.map((b) => [
        b.id,
        b.status,
        b.totalPrice.toString(),
        b.checkIn.toISOString(),
        b.checkOut.toISOString(),
        String(b.guests),
        b.user.email,
        b.hotel.name,
        b.room.name,
        b.createdAt.toISOString(),
      ]);

      if (q.format === 'pdf') {
        const pdf = await buildBookingsReportPdf(csvHeaders, csvRows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=stayhub-reports.pdf');
        res.status(200).send(Buffer.from(pdf));
        return;
      }

      const escape = (s: string) => {
        const v = s.replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      };

      const csv =
        csvHeaders.join(',') +
        '\n' +
        csvRows.map((row) => row.map((cell) => escape(String(cell))).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=stayhub-reports.csv');
      res.status(200).send(csv);
    } catch (e) {
      next(e);
    }
  });

  r.get('/customers', async (req: Request, res: Response, next) => {
    try {
      if (req.user!.role !== 'SUPER_ADMIN') throw new ForbiddenError();
      const q = adminCustomersListQuerySchema.parse(req.query);
      const where =
        q.q && q.q.trim().length > 0
          ? {
              OR: [
                { email: { contains: q.q.trim(), mode: 'insensitive' as const } },
                { name: { contains: q.q.trim(), mode: 'insensitive' as const } },
              ],
            }
          : {};
      const [total, items] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        }),
      ]);
      res.json({ items, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) });
    } catch (e) {
      next(e);
    }
  });

  r.get('/settings', async (req: Request, res: Response, next) => {
    try {
      if (req.user!.role !== 'SUPER_ADMIN') throw new ForbiddenError();
      const rows = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
      res.json({ items: rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt })) });
    } catch (e) {
      next(e);
    }
  });

  r.put('/settings', async (req: Request, res: Response, next) => {
    try {
      if (req.user!.role !== 'SUPER_ADMIN') throw new ForbiddenError();
      const body = siteSettingsBulkSchema.parse(req.body);
      await prisma.$transaction(
        body.settings.map((s) =>
          prisma.siteSetting.upsert({
            where: { key: s.key },
            create: { key: s.key, value: s.value },
            update: { value: s.value },
          })
        )
      );
      const rows = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
      res.json({ items: rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt })) });
    } catch (e) {
      next(e);
    }
  });

  return r;
}
