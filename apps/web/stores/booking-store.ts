import { create } from 'zustand';

type BookingDraft = {
  hotelSlug: string | null;
  roomId: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  setDraft: (p: Partial<Omit<BookingDraft, 'setDraft' | 'reset'>>) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingDraft>((set) => ({
  hotelSlug: null,
  roomId: null,
  checkIn: null,
  checkOut: null,
  guests: 2,
  setDraft: (p) => set((s) => ({ ...s, ...p })),
  reset: () =>
    set({
      hotelSlug: null,
      roomId: null,
      checkIn: null,
      checkOut: null,
      guests: 2,
    }),
}));
