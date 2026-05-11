import type { Env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { sendMail } from '../../lib/email.js';

export async function sendBookingCreatedEmail(env: Env, bookingId: string): Promise<void> {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, hotel: { select: { name: true } } },
  });
  if (!b) return;
  const to = b.guestEmail ?? b.user.email;
  await sendMail(env, {
    to,
    subject: `Booking created — ${b.hotel.name}`,
    text: `Hi ${b.guestName ?? b.user.name},\n\nYour reservation at ${b.hotel.name} is pending payment.\nBooking ID: ${b.id}\n\nComplete checkout from your StayHub account.\n`,
  });
}

export async function sendBookingConfirmedEmail(env: Env, bookingId: string): Promise<void> {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, hotel: { select: { name: true, city: true } }, room: { select: { name: true } } },
  });
  if (!b) return;
  const to = b.guestEmail ?? b.user.email;
  await sendMail(env, {
    to,
    subject: `Confirmed — ${b.hotel.name}`,
    text: `Hi ${b.guestName ?? b.user.name},\n\nPayment received. Your stay at ${b.hotel.name} (${b.room.name}) is confirmed.\nCheck-in: ${b.checkIn.toISOString().slice(0, 10)}\nCheck-out: ${b.checkOut.toISOString().slice(0, 10)}\nBooking ID: ${b.id}\n`,
  });
}

export async function sendBookingCancelledEmail(env: Env, bookingId: string): Promise<void> {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, hotel: { select: { name: true } } },
  });
  if (!b) return;
  const to = b.guestEmail ?? b.user.email;
  await sendMail(env, {
    to,
    subject: `Booking cancelled — ${b.hotel.name}`,
    text: `Hi ${b.guestName ?? b.user.name},\n\nYour booking ${b.id} at ${b.hotel.name} has been cancelled.\nIf you did not request this, contact support.\n`,
  });
}
