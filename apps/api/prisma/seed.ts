import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { slugify } from '../src/utils/slug.js';

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, '../../../.env') });

const prisma = new PrismaClient();

const HOTEL_NAMES = [
  'Azure Harbor Resort',
  'Grand Plaza Hotel',
  'Urban Nest Suites',
  'Seaside Pearl Inn',
  'Mountain Peak Lodge',
  'Riverside Retreat',
  'City Lights Tower',
  'Garden Court Boutique',
  'Sunset Boulevard Hotel',
  'Royal Heritage Palace',
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  await prisma.refreshToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  const superAdmin = await prisma.user.create({
    data: {
      email: 'super@example.com',
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      passwordHash,
      name: 'Hotel Manager',
      role: 'HOTEL_MANAGER',
      emailVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      name: 'Test Customer',
      role: 'CUSTOMER',
      emailVerified: true,
    },
  });

  const amenitiesPool = ['wifi', 'pool', 'spa', 'gym', 'parking', 'breakfast', 'bar', 'concierge'];

  // Platform inventory vs manager-owned: API scopes HOTEL_MANAGER to ownerId only.
  // Demo manager should see a small portfolio; super admin retains the bulk catalog.
  const MANAGER_HOTEL_START_INDEX = 8;

  for (let i = 0; i < HOTEL_NAMES.length; i++) {
    const name = HOTEL_NAMES[i]!;
    const slug = slugify(name);
    const city = ['Barcelona', 'Lisbon', 'Paris', 'Berlin', 'Amsterdam', 'Rome', 'Vienna', 'Prague', 'Dublin', 'London'][i % 10]!;
    const country = ['Spain', 'Portugal', 'France', 'Germany', 'Netherlands', 'Italy', 'Austria', 'Czechia', 'Ireland', 'UK'][i % 10]!;
    const ownerId = i >= MANAGER_HOTEL_START_INDEX ? manager.id : superAdmin.id;
    const hotel = await prisma.hotel.create({
      data: {
        ownerId,
        name,
        slug,
        description: `${name} offers premium comfort in the heart of ${city}.`,
        address: `${100 + i} Main Street`,
        city,
        country,
        lat: 40 + i * 0.1,
        lng: -3 + i * 0.05,
        starRating: 3 + (i % 3),
        amenities: amenitiesPool.slice(0, 4 + (i % 4)),
        images: [`https://picsum.photos/seed/${slug}-1/800/600`, `https://picsum.photos/seed/${slug}-2/800/600`],
        status: 'ACTIVE',
      },
    });

    const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Family', 'Penthouse'];
    for (let r = 0; r < 5; r++) {
      await prisma.room.create({
        data: {
          hotelId: hotel.id,
          name: `${roomTypes[r]} Room`,
          type: roomTypes[r]!.toLowerCase(),
          description: `Comfortable ${roomTypes[r]} with city views.`,
          pricePerNight: 80 + r * 35 + i * 3,
          capacity: 2 + (r % 3),
          beds: 1 + (r % 2),
          amenities: ['wifi', 'tv', 'minibar'].slice(0, 2 + (r % 2)),
          images: [`https://picsum.photos/seed/${hotel.slug}-r${r}/600/400`],
          totalQuantity: 3 + (r % 4),
        },
      });
    }
  }

  const firstHotel = await prisma.hotel.findFirst({ include: { rooms: true } });
  const firstRoom = firstHotel?.rooms[0];
  if (firstRoom && firstHotel) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);
    await prisma.booking.create({
      data: {
        userId: customer.id,
        hotelId: firstHotel.id,
        roomId: firstRoom.id,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: new Prisma.Decimal(Number(firstRoom.pricePerNight) * 3),
        status: 'CONFIRMED',
      },
    });
  }

  console.log('Seed complete:', { superAdmin: superAdmin.email, manager: manager.email, customer: customer.email });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
