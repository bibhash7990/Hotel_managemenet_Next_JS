import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import { nightsBetween } from '../../utils/dates.js';
import type { CreateBookingInput, PatchBookingBody } from '@hotel/shared';
import Stripe from 'stripe';
import type { Env } from '../../config/env.js';
import { notifyUser } from '../notifications/notify-user.js';
import { sendBookingCreatedEmail, sendBookingCancelledEmail, sendBookingConfirmedEmail } from './booking-emails.js';
import { writeAuditLog } from '../../lib/audit-log.js';

const bookingDetailInclude = {
  hotel: { select: { id: true, name: true, slug: true, city: true, country: true, images: true } },
  room: { select: { id: true, name: true, type: true, capacity: true, pricePerNight: true } },
  payment: { select: { id: true, status: true, stripePaymentIntentId: true } },
} as const;

export async function createBooking(userId: string, input: CreateBookingInput, env: Env) {
  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  if (!(checkOut > checkIn)) {
    throw new ValidationError('checkOut must be after checkIn');
  }

  const booking = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`SELECT id FROM "Room" WHERE id = ${input.roomId} FOR UPDATE`);

    const room = await tx.room.findUnique({
      where: { id: input.roomId },
      include: { hotel: true },
    });
    if (!room || room.status !== 'ACTIVE' || room.hotel.status !== 'ACTIVE') {
      throw new NotFoundError('Room not available');
    }
    if (input.guests > room.capacity) {
      throw new ValidationError('Guests exceed room capacity');
    }

    const overlapping = await tx.booking.count({
      where: {
        roomId: room.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });

    if (overlapping >= room.totalQuantity) {
      throw new ConflictError('No rooms available for these dates');
    }

    const nights = nightsBetween(checkIn, checkOut);
    const price = Number(room.pricePerNight);
    const totalPrice = new Prisma.Decimal(price * nights);

    return tx.booking.create({
      data: {
        userId,
        hotelId: room.hotelId,
        roomId: room.id,
        checkIn,
        checkOut,
        guests: input.guests,
        totalPrice,
        status: 'PENDING',
        specialRequests: input.specialRequests,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
      },
    });
  });

  void notifyUser({
    userId,
    type: 'booking_created',
    title: 'Booking created',
    message: 'Complete payment to confirm your stay.',
    link: `/dashboard/bookings/${booking.id}`,
  });

  void sendBookingCreatedEmail(env, booking.id);
  writeAuditLog({
    actorId: userId,
    action: 'booking.create',
    resource: booking.id,
    metadata: { hotelId: booking.hotelId, roomId: booking.roomId },
  });

  return booking;
}

export async function listMyBookings(userId: string, page: number, limit: number, status?: string) {
  const where = {
    userId,
    ...(status ? { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        hotel: { select: { id: true, name: true, slug: true, city: true, images: true } },
        room: { select: { id: true, name: true, type: true } },
      },
    }),
  ]);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function getMyBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: bookingDetailInclude,
  });
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
}

export async function cancelBooking(userId: string, bookingId: string, env: Env) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.userId !== userId) throw new ForbiddenError();
  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    throw new ValidationError('Booking cannot be cancelled');
  }
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
  void sendBookingCancelledEmail(env, bookingId);
  writeAuditLog({
    actorId: userId,
    action: 'booking.cancel',
    resource: bookingId,
    metadata: { previousStatus: booking.status },
  });
  return updated;
}

export async function modifyMyBooking(userId: string, bookingId: string, body: Extract<PatchBookingBody, { action: 'modify' }>) {
  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  if (!(checkOut > checkIn)) {
    throw new ValidationError('checkOut must be after checkIn');
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });
    if (!existing || existing.userId !== userId) throw new NotFoundError('Booking not found');
    if (existing.status !== 'PENDING' && existing.status !== 'CONFIRMED') {
      throw new ValidationError('Booking cannot be modified');
    }
    if (existing.status === 'CONFIRMED' && existing.checkIn <= new Date()) {
      throw new ValidationError('Stay already started; contact support to change dates.');
    }

    await tx.$executeRaw(Prisma.sql`SELECT id FROM "Room" WHERE id = ${existing.roomId} FOR UPDATE`);

    const room = await tx.room.findUnique({
      where: { id: existing.roomId },
      include: { hotel: true },
    });
    if (!room || room.status !== 'ACTIVE' || room.hotel.status !== 'ACTIVE') {
      throw new NotFoundError('Room not available');
    }
    if (body.guests > room.capacity) {
      throw new ValidationError('Guests exceed room capacity');
    }

    const overlapping = await tx.booking.count({
      where: {
        roomId: room.id,
        id: { not: bookingId },
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });

    if (overlapping >= room.totalQuantity) {
      throw new ConflictError('No rooms available for these dates');
    }

    const nights = nightsBetween(checkIn, checkOut);
    const price = Number(room.pricePerNight);
    const totalPrice = new Prisma.Decimal(price * nights);

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        checkIn,
        checkOut,
        guests: body.guests,
        totalPrice,
        specialRequests: body.specialRequests ?? existing.specialRequests,
      },
      include: bookingDetailInclude,
    });
  });
}

export async function createPaymentIntent(env: Env, userId: string, bookingId: string) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ValidationError('Stripe is not configured');
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, hotel: { select: { name: true } } },
  });
  if (!booking || booking.userId !== userId) {
    throw new NotFoundError('Booking not found');
  }
  if (booking.status !== 'PENDING') {
    throw new ValidationError('Booking is not awaiting payment');
  }

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(booking.totalPrice) * 100),
      currency: 'usd',
      metadata: { bookingId: booking.id },
      automatic_payment_methods: { enabled: true },
    });
  } catch (err) {
    logger.error({ err, bookingId: booking.id, userId }, 'Stripe paymentIntents.create failed');
    throw new ServiceUnavailableError('Payment provider is unavailable. Please try again shortly.');
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripePaymentIntentId: intent.id },
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}

export async function createCheckoutSession(env: Env, userId: string, bookingId: string) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ValidationError('Stripe is not configured');
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { hotel: { select: { name: true } } },
  });
  if (!booking || booking.userId !== userId) {
    throw new NotFoundError('Booking not found');
  }
  if (booking.status !== 'PENDING') {
    throw new ValidationError('Booking is not awaiting payment');
  }

  const successUrl = `${env.WEB_ORIGIN.replace(/\/$/, '')}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.WEB_ORIGIN.replace(/\/$/, '')}/book?cancelled=1`;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id },
      payment_intent_data: { metadata: { bookingId: booking.id } },
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(Number(booking.totalPrice) * 100),
            product_data: {
              name: `${booking.hotel.name} — reservation`,
              description: `Booking ${booking.id}`,
            },
          },
        },
      ],
    });
  } catch (err) {
    logger.error({ err, bookingId: booking.id, userId }, 'Stripe checkout.sessions.create failed');
    throw new ServiceUnavailableError('Payment provider is unavailable. Please try again shortly.');
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { url: session.url, sessionId: session.id };
}

export async function getMyBookingByCheckoutSession(env: Env, userId: string, sessionId: string) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ValidationError('Stripe is not configured');
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id;
  if (!bookingId) throw new ValidationError('Invalid session');

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
      stripeCheckoutSessionId: sessionId,
    },
    include: bookingDetailInclude,
  });
  if (!booking) throw new NotFoundError('Booking not found');

  return { booking, paymentStatus: session.payment_status };
}

/** Apply successful Stripe payment to booking + Payment row (idempotent). */
export async function confirmBookingPaymentFromIntent(
  env: Env,
  params: {
    bookingId: string;
    paymentIntentId: string;
    amountReceivedCents: number;
    currency: string;
  }
): Promise<void> {
  let becameConfirmed = false;
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: params.bookingId } });
    if (!booking) return;
    if (booking.stripePaymentIntentId && booking.stripePaymentIntentId !== params.paymentIntentId) {
      return;
    }
    if (booking.status === 'CONFIRMED') {
      await tx.payment.upsert({
        where: { bookingId: params.bookingId },
        create: {
          bookingId: params.bookingId,
          stripePaymentIntentId: params.paymentIntentId,
          amount: new Prisma.Decimal(params.amountReceivedCents / 100),
          currency: params.currency,
          status: 'SUCCEEDED',
        },
        update: {
          status: 'SUCCEEDED',
          amount: new Prisma.Decimal(params.amountReceivedCents / 100),
          stripePaymentIntentId: params.paymentIntentId,
        },
      });
      return;
    }
    const wasPending = booking.status === 'PENDING';
    await tx.booking.update({
      where: { id: params.bookingId },
      data: {
        status: 'CONFIRMED',
        stripePaymentIntentId: params.paymentIntentId,
      },
    });

    await tx.payment.upsert({
      where: { bookingId: params.bookingId },
      create: {
        bookingId: params.bookingId,
        stripePaymentIntentId: params.paymentIntentId,
        amount: new Prisma.Decimal(params.amountReceivedCents / 100),
        currency: params.currency,
        status: 'SUCCEEDED',
      },
      update: {
        status: 'SUCCEEDED',
        amount: new Prisma.Decimal(params.amountReceivedCents / 100),
        stripePaymentIntentId: params.paymentIntentId,
      },
    });
    if (wasPending) becameConfirmed = true;
  });

  if (becameConfirmed) {
    void sendBookingConfirmedEmail(env, params.bookingId);
    writeAuditLog({
      actorId: null,
      action: 'booking.payment_confirmed',
      resource: params.bookingId,
      metadata: { paymentIntentId: params.paymentIntentId },
    });
  }
}

export async function markPaymentFailedForIntent(paymentIntentId: string): Promise<void> {
  const byBooking = await prisma.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  const byPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { booking: true },
  });
  const booking = byBooking ?? byPayment?.booking;
  if (!booking) return;

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntentId,
      amount: booking.totalPrice,
      currency: 'usd',
      status: 'FAILED',
    },
    update: { status: 'FAILED', stripePaymentIntentId: paymentIntentId },
  });
}
