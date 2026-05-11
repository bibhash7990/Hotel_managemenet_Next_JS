import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import type { HotelListQuery } from '@hotel/shared';
import { ReviewModel } from '../../models/mongo/Review.js';
import { getRedis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';

type ListQuery = HotelListQuery;

function mergeHotelIdIn(
  current: Prisma.HotelWhereInput['id'],
  ids: string[]
): Prisma.StringFilter {
  if (
    current &&
    typeof current === 'object' &&
    'in' in current &&
    Array.isArray((current as { in: string[] }).in)
  ) {
    const prev = (current as { in: string[] }).in;
    return { in: prev.filter((id) => ids.includes(id)) };
  }
  return { in: ids };
}

function cacheKey(q: ListQuery): string {
  return `hotels:list:${JSON.stringify(q)}`;
}

export async function listHotels(query: ListQuery) {
  const redis = getRedis();
  if (redis) {
    try {
      const hit = await redis.get(cacheKey(query));
      if (hit) {
        return JSON.parse(hit) as Awaited<ReturnType<typeof listHotelsUncached>>;
      }
    } catch (err) {
      logger.warn({ err }, 'redis get hotels list');
    }
  }

  const result = await listHotelsUncached(query);

  if (redis) {
    try {
      await redis.set(cacheKey(query), JSON.stringify(result), 'EX', 60);
    } catch (err) {
      logger.warn({ err }, 'redis set hotels list');
    }
  }

  return result;
}

async function listHotelsUncached(query: ListQuery) {
  const where: Prisma.HotelWhereInput = {
    status: 'ACTIVE',
    ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
    ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
    ...(query.minStars ? { starRating: { gte: query.minStars } } : {}),
  };

  const roomsFilter: Prisma.RoomWhereInput = {
    status: 'ACTIVE',
    ...(query.minPrice != null ? { pricePerNight: { gte: query.minPrice } } : {}),
    ...(query.maxPrice != null ? { pricePerNight: { lte: query.maxPrice } } : {}),
    ...(query.roomType
      ? { type: { contains: query.roomType, mode: 'insensitive' as const } }
      : {}),
  };

  const hasRoomFilters = query.minPrice != null || query.maxPrice != null || !!query.roomType;
  if (hasRoomFilters) {
    where.rooms = { some: roomsFilter };
  }

  const tags = query.amenities
    ? query.amenities
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  if (tags.length) {
    const amenityClause = tags.map(
      (tag) =>
        Prisma.sql`(h.amenities::jsonb @> ${JSON.stringify([tag])}::jsonb OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(h.amenities::jsonb) e WHERE lower(e) = ${tag}))`
    );
    const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT h.id FROM "Hotel" h
      WHERE h.status = 'ACTIVE'
      ${query.city ? Prisma.sql`AND lower(h.city) = lower(${query.city})` : Prisma.empty}
      ${query.country ? Prisma.sql`AND lower(h.country) = lower(${query.country})` : Prisma.empty}
      AND ${Prisma.join(amenityClause, ' AND ')}
    `);
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    where.id = mergeHotelIdIn(where.id, ids);
  }

  if (query.rooms != null && query.rooms > 1) {
    const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT h.id FROM "Hotel" h
      WHERE h.status = 'ACTIVE'
      AND (
        SELECT COUNT(*)::int FROM "Room" r WHERE r."hotelId" = h.id AND r.status = 'ACTIVE'
      ) >= ${query.rooms}
    `);
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    where.id = mergeHotelIdIn(where.id, ids);
  }

  if (
    query.minReviewAvg != null &&
    !Number.isNaN(query.minReviewAvg) &&
    query.minReviewAvg >= 1 &&
    query.minReviewAvg <= 5
  ) {
    const agg = (await ReviewModel.aggregate([
      { $match: { moderationStatus: 'APPROVED' } },
      { $group: { _id: '$hotelId', avgRating: { $avg: '$rating' } } },
      { $match: { avgRating: { $gte: query.minReviewAvg } } },
    ])) as { _id: string }[];
    const ids = agg.map((a) => String(a._id));
    if (ids.length === 0) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    where.id = mergeHotelIdIn(where.id, ids);
  }

  if (
    query.nearLat != null &&
    query.nearLng != null &&
    query.maxKm != null &&
    !Number.isNaN(query.nearLat) &&
    !Number.isNaN(query.nearLng)
  ) {
    const km = query.maxKm;
    const lat = query.nearLat;
    const lng = query.nearLng;
    const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT id FROM "Hotel"
      WHERE status = 'ACTIVE'
        AND lat IS NOT NULL AND lng IS NOT NULL
        AND (6371 * acos(
          least(1::float, greatest(-1::float,
            cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng}))
            + sin(radians(${lat})) * sin(radians(lat))
          ))
        )) <= ${km}
    `);
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) {
      return {
        items: [],
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      };
    }
    where.id = mergeHotelIdIn(where.id, ids);
  }

  const orderBy: Prisma.HotelOrderByWithRelationInput =
    query.sort === 'rating'
      ? { starRating: 'desc' }
      : { createdAt: 'desc' };

  const [total, hotels] = await Promise.all([
    prisma.hotel.count({ where }),
    prisma.hotel.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        rooms: {
          where: { status: 'ACTIVE' },
          take: 5,
          orderBy: { pricePerNight: query.sort === 'price_asc' ? 'asc' : 'desc' },
        },
      },
    }),
  ]);

  const minPriceForHotel = (hotel: (typeof hotels)[0]) => {
    const prices = hotel.rooms.map((r) => Number(r.pricePerNight));
    return prices.length ? Math.min(...prices) : null;
  };

  let items = hotels.map((h) => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    city: h.city,
    country: h.country,
    starRating: h.starRating,
    images: h.images as string[],
    minPrice: minPriceForHotel(h),
    lat: h.lat,
    lng: h.lng,
  }));

  if (query.sort === 'price_asc') {
    items = items.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
  }
  if (query.sort === 'price_desc') {
    items = items.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
  }

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getHotelBySlug(slug: string) {
  const hotel = await prisma.hotel.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      rooms: { where: { status: 'ACTIVE' }, orderBy: { pricePerNight: 'asc' } },
      owner: { select: { id: true, name: true } },
    },
  });
  if (!hotel) throw new NotFoundError('Hotel not found');
  return hotel;
}

export async function getHotelRoomBySlug(slug: string, roomId: string) {
  const hotel = await getHotelBySlug(slug);
  const room = hotel.rooms.find((r) => r.id === roomId);
  if (!room) throw new NotFoundError('Room not found');
  return {
    hotel: {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      city: hotel.city,
      country: hotel.country,
      lat: hotel.lat,
      lng: hotel.lng,
      images: hotel.images as string[],
    },
    room,
  };
}
