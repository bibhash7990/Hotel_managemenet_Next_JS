import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ValidationError } from '../../lib/errors.js';

export async function availabilityForSlug(
  slug: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
) {
  const hotel = await prisma.hotel.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      rooms: {
        where: { status: 'ACTIVE', capacity: { gte: guests } },
      },
    },
  });
  if (!hotel) throw new NotFoundError('Hotel not found');

  const rooms = await Promise.all(
    hotel.rooms.map(async (room) => {
      const overlapping = await prisma.booking.count({
        where: {
          roomId: room.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
          AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
        },
      });
      const availableUnits = Math.max(0, room.totalQuantity - overlapping);
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        pricePerNight: room.pricePerNight.toString(),
        capacity: room.capacity,
        availableUnits,
        canBook: availableUnits > 0,
      };
    })
  );

  return { hotelSlug: slug, checkIn, checkOut, guests, rooms };
}

/** Per-night availability for one room (UTC midnight slices). */
export async function roomNightCalendar(hotelSlug: string, roomId: string, start: Date, nights: number) {
  if (nights < 1 || nights > 120) throw new ValidationError('nights must be between 1 and 120');
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { hotel: true },
  });
  if (!room || room.status !== 'ACTIVE' || room.hotel.status !== 'ACTIVE') {
    throw new NotFoundError('Room not found');
  }
  if (room.hotel.slug !== hotelSlug) {
    throw new ValidationError('Room does not belong to this hotel');
  }

  const dates: { date: string; available: boolean; availableUnits: number }[] = [];
  const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

  for (let i = 0; i < nights; i += 1) {
    const checkIn = new Date(startDay);
    checkIn.setUTCDate(startDay.getUTCDate() + i);
    const checkOut = new Date(checkIn);
    checkOut.setUTCDate(checkIn.getUTCDate() + 1);

    const overlapping = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });
    const availableUnits = Math.max(0, room.totalQuantity - overlapping);
    dates.push({
      date: checkIn.toISOString().slice(0, 10),
      available: availableUnits > 0,
      availableUnits,
    });
  }

  return { roomId, hotelSlug: room.hotel.slug, dates };
}
