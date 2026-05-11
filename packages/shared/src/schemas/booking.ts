import { z } from 'zod';

export const createBookingSchema = z.object({
  roomId: z.string().cuid(),
  checkIn: z.string().datetime({ offset: true }),
  checkOut: z.string().datetime({ offset: true }),
  guests: z.number().int().min(1).max(20),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email().max(320),
  guestPhone: z.string().max(40).optional(),
  specialRequests: z.string().max(2000).optional(),
});

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
});

export const availabilityQuerySchema = z.object({
  checkIn: z.string().datetime({ offset: true }),
  checkOut: z.string().datetime({ offset: true }),
  guests: z.coerce.number().int().min(1).max(20).default(1),
});

export const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(6).default([]),
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(['APPROVED', 'REJECTED']),
});

/** Customer PATCH /bookings/:id — cancel or change dates/guests while rules allow. */
export const patchBookingBodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({
    action: z.literal('modify'),
    checkIn: z.string().datetime({ offset: true }),
    checkOut: z.string().datetime({ offset: true }),
    guests: z.number().int().min(1).max(20),
    specialRequests: z.string().max(2000).optional(),
  }),
]);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type PatchBookingBody = z.infer<typeof patchBookingBodySchema>;
