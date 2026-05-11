import { z } from 'zod';

export const hotelListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minStars: z.coerce.number().int().min(1).max(5).optional(),
  /** Comma-separated amenity tags (e.g. wifi,pool) — hotel JSON amenities must include each. */
  amenities: z.string().max(500).optional(),
  /** Filter hotels that have at least one active room of this type (case-insensitive contains). */
  roomType: z.string().max(80).optional(),
  /** Minimum number of distinct active room types (maps hero “rooms” search). */
  rooms: z.coerce.number().int().min(1).max(20).optional(),
  nearLat: z.coerce.number().optional(),
  nearLng: z.coerce.number().optional(),
  /** Kilometres from nearLat/nearLng when both coordinates are set. */
  maxKm: z.coerce.number().min(1).max(500).optional(),
  /** Minimum average rating of approved reviews (Mongo). */
  minReviewAvg: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).default('newest'),
});

export const createHotelSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(80),
  country: z.string().min(1).max(80),
  lat: z.number().optional(),
  lng: z.number().optional(),
  starRating: z.number().int().min(1).max(5),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
});

export const updateHotelSchema = createHotelSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']).optional(),
});

export const createRoomSchema = z.object({
  hotelId: z.string().cuid(),
  name: z.string().min(1).max(120),
  type: z.string().min(1).max(80),
  description: z.string().max(5000).optional(),
  pricePerNight: z.number().positive(),
  capacity: z.number().int().min(1).max(20),
  beds: z.number().int().min(1).max(20),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  totalQuantity: z.number().int().min(1).max(500),
});

export const updateRoomSchema = createRoomSchema.partial().omit({ hotelId: true });

export type HotelListQuery = z.infer<typeof hotelListQuerySchema>;
