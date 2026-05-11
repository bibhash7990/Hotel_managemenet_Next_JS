'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BedDouble, CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

type Variant = 'hero' | 'inline';

export function SearchHero({ variant = 'hero' }: { variant?: Variant }) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');

  const minOut = useMemo(() => (checkIn ? checkIn : todayISO(1)), [checkIn]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city.trim()) q.set('city', city.trim());
    if (checkIn) q.set('checkIn', checkIn);
    if (checkOut) q.set('checkOut', checkOut);
    if (guests) q.set('guests', guests);
    if (rooms.trim() && rooms.trim() !== '1') q.set('rooms', rooms.trim());
    router.push(`/hotels?${q.toString()}`);
  };

  const fieldClass =
    'group relative flex flex-1 items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-left transition-shadow hover:shadow-soft focus-within:shadow-elevated dark:bg-slate-900/95';
  const labelClass = 'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground';
  const inputClass =
    'w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-50';

  return (
    <form
      onSubmit={submit}
      className={
        variant === 'hero'
          ? 'mx-auto flex w-full max-w-5xl flex-col items-stretch gap-2 rounded-3xl border border-white/40 bg-white/80 p-2 shadow-elevated backdrop-blur-md md:flex-row md:items-center dark:border-slate-700 dark:bg-slate-900/80'
          : 'flex w-full flex-col items-stretch gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft md:flex-row md:items-center'
      }
      role="search"
      aria-label="Search hotels"
    >
      <label className={fieldClass}>
        <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="flex flex-col">
          <span className={labelClass}>Destination</span>
          <input
            type="text"
            placeholder="City, e.g. Paris"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
          />
        </span>
      </label>

      <span className="hidden h-10 w-px bg-border md:block dark:bg-slate-700" aria-hidden />

      <label className={fieldClass}>
        <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="flex flex-col">
          <span className={labelClass}>Check-in</span>
          <input
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputClass}
          />
        </span>
      </label>

      <span className="hidden h-10 w-px bg-border md:block dark:bg-slate-700" aria-hidden />

      <label className={fieldClass}>
        <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="flex flex-col">
          <span className={labelClass}>Check-out</span>
          <input
            type="date"
            min={minOut}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputClass}
          />
        </span>
      </label>

      <span className="hidden h-10 w-px bg-border md:block dark:bg-slate-700" aria-hidden />

      <label className={`${fieldClass} md:max-w-[150px]`}>
        <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="flex flex-col">
          <span className={labelClass}>Guests</span>
          <input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={inputClass}
          />
        </span>
      </label>

      <span className="hidden h-10 w-px bg-border md:block dark:bg-slate-700" aria-hidden />

      <label className={`${fieldClass} md:max-w-[120px]`}>
        <BedDouble className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span className="flex flex-col">
          <span className={labelClass}>Rooms</span>
          <input
            type="number"
            min={1}
            max={10}
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className={inputClass}
            aria-label="Number of rooms"
          />
        </span>
      </label>

      <Button type="submit" size="lg" className="md:ml-1">
        <Search className="h-4 w-4" aria-hidden />
        <span>Search</span>
      </Button>
    </form>
  );
}
