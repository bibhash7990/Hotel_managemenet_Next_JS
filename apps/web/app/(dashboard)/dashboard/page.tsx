'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Hotel, MapPin } from 'lucide-react';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { BookingsListSkeleton, EmptyState, ErrorState } from '@/components/query-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Booking = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  totalPrice: unknown;
  hotel: { name: string; slug: string; city?: string; country?: string; images?: string[] };
  room: { name: string };
};

type BookingsResponse = { items: Booking[] };

const statusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'muted' | 'info' => {
  const s = status.toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'success';
  if (s === 'PENDING' || s === 'PROCESSING') return 'warning';
  if (s === 'CANCELLED' || s === 'FAILED') return 'destructive';
  if (s === 'CHECKED_IN' || s === 'CHECKED_OUT') return 'info';
  return 'muted';
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const nights = (a: string, b: string) =>
  Math.max(
    1,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
  );

export default function DashboardPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login?next=/dashboard');
  }, [router]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['my-bookings', token],
    enabled: !!token,
    queryFn: () =>
      apiJson<BookingsResponse>('/api/v1/bookings/me?limit=50', { accessToken: token! }),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const now = Date.now();
    return data.items.filter((b) => {
      const out = new Date(b.checkOut).getTime();
      return tab === 'upcoming' ? out >= now : out < now;
    });
  }, [data, tab]);

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Your trips"
        title="Bookings"
        description="Upcoming and past stays tied to your account — view, modify, or pay any time."
      />

      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'h-9 rounded-full px-4 text-sm font-medium capitalize transition-colors',
              tab === t
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isPending && <BookingsListSkeleton />}
        {isError && (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        )}
        {data && filtered.length === 0 && (
          <EmptyState
            icon={Hotel}
            title={tab === 'upcoming' ? 'No upcoming trips' : 'No past trips yet'}
            description={
              tab === 'upcoming'
                ? 'When you complete a reservation, it will appear here with status and payment details.'
                : 'Your past stays will live here once you have completed a booking.'
            }
            action={
              <Link href="/hotels">
                <Button type="button">Browse hotels</Button>
              </Link>
            }
          />
        )}
        {data && filtered.length > 0 && (
          <ul className="space-y-4">
            {filtered.map((b) => {
              const img = b.hotel.images?.[0] ?? 'https://picsum.photos/seed/booking/600/400';
              const n = nights(b.checkIn, b.checkOut);
              return (
                <li
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:border-primary/30 hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr_auto] sm:items-center">
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="contents focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <div className="relative h-32 w-full overflow-hidden rounded-xl sm:h-28 sm:w-40">
                        <Image
                          src={img}
                          alt={b.hotel.name}
                          fill
                          sizes="(max-width:640px) 100vw, 160px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {n} night{n === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="mt-2 truncate font-serif text-xl">{b.hotel.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{b.room.name}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                            {fmt(b.checkIn)} → {fmt(b.checkOut)}
                          </span>
                          {b.hotel.city ? (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" aria-hidden />
                              {b.hotel.city}
                              {b.hotel.country ? `, ${b.hotel.country}` : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-col items-stretch justify-between gap-3 sm:items-end">
                      <p className="text-right">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          Total
                        </span>
                        <span className="block text-xl font-semibold text-foreground">
                          ${String(b.totalPrice)}
                        </span>
                      </p>
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Details
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        {b.status === 'COMPLETED' ? (
                          <Link
                            href={`/dashboard/reviews/write?bookingId=${encodeURIComponent(b.id)}`}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Write a review
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
