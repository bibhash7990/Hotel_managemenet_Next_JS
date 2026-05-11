'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/booking-store';

export function RoomReserveButton({ hotelSlug, roomId }: { hotelSlug: string; roomId: string }) {
  const router = useRouter();
  const setDraft = useBookingStore((s) => s.setDraft);
  return (
    <Button
      type="button"
      size="lg"
      onClick={() => {
        setDraft({ hotelSlug, roomId });
        router.push('/book');
      }}
    >
      Reserve this room
    </Button>
  );
}
