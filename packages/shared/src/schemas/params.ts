import { z } from 'zod';

/** URL-safe hotel slug segment (matches typical slugify output). */
export const hotelSlugParamSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, 'Invalid slug');

export const mongoObjectIdParamSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

/** Admin list: page/limit with optional hotel filter (cuid). */
export const adminRoomsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hotelId: z.string().cuid().optional(),
});

export const adminBookingsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminCustomersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
});

export const wishlistListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminReportExportQuerySchema = z.object({
  format: z.enum(['csv', 'pdf']).default('csv'),
  limit: z.coerce.number().int().min(1).max(2000).default(500),
});
