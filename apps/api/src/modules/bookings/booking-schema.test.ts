import { describe, expect, it } from 'vitest';
import { createBookingSchema } from '@hotel/shared';

describe('createBookingSchema', () => {
  it('accepts valid payload', () => {
    const parsed = createBookingSchema.parse({
      roomId: 'ckv2q3w4e5r6t7y8u9i0j1k2',
      checkIn: '2026-06-01T14:00:00.000Z',
      checkOut: '2026-06-05T11:00:00.000Z',
      guests: 2,
      guestName: 'Test Guest',
      guestEmail: 'guest@example.com',
      guestPhone: '+15550001111',
    });
    expect(parsed.guests).toBe(2);
  });

  it('rejects invalid room id', () => {
    expect(() =>
      createBookingSchema.parse({
        roomId: 'not-a-cuid',
        checkIn: '2026-06-01T14:00:00.000Z',
        checkOut: '2026-06-05T11:00:00.000Z',
        guests: 1,
        guestName: 'A',
        guestEmail: 'a@b.co',
      })
    ).toThrow();
  });
});
