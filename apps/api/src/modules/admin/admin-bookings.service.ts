import Stripe from 'stripe';
import { prisma } from '../../lib/prisma.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import type { Env } from '../../config/env.js';
import type { UserRole } from '@prisma/client';

export async function refundBookingAsAdmin(
  env: Env,
  actor: { id: string; role: UserRole },
  bookingId: string
): Promise<{ refundId: string; bookingId: string }> {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ValidationError('Stripe is not configured');
  }
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { hotel: true, payment: true },
  });
  if (!booking) throw new NotFoundError('Booking not found');
  if (actor.role !== 'SUPER_ADMIN' && booking.hotel.ownerId !== actor.id) {
    throw new ForbiddenError();
  }
  if (booking.status !== 'CONFIRMED') {
    throw new ValidationError('Only confirmed bookings with a successful payment can be refunded');
  }
  const piId = booking.payment?.stripePaymentIntentId ?? booking.stripePaymentIntentId;
  if (!piId) {
    throw new ValidationError('No Stripe payment intent is linked to this booking');
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  let refund: Stripe.Refund;
  try {
    refund = await stripe.refunds.create({ payment_intent: piId });
  } catch (err) {
    logger.error({ err, bookingId }, 'Stripe refund failed');
    throw new ValidationError('Refund could not be processed. Check Stripe dashboard.');
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId: booking.id },
      data: { status: 'REFUNDED', refundId: refund.id },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    }),
  ]);

  return { refundId: refund.id, bookingId: booking.id };
}
