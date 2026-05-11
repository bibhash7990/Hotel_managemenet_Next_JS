'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  MessageSquare,
  Users,
} from 'lucide-react';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ErrorState, HotelDetailSkeleton } from '@/components/query-state';
import { StripeCheckoutButton } from '@/components/booking/stripe-checkout-button';
import { toast } from 'sonner';

type BookingDetail = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: unknown;
  specialRequests: string | null;
  hotel: { id: string; name: string; slug: string; city: string; country: string; images: unknown };
  room: { id: string; name: string; type: string; capacity: number };
  payment: { status: string } | null;
};

const statusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'muted' | 'info' => {
  const s = status.toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'PAID') return 'success';
  if (s === 'PENDING' || s === 'PROCESSING') return 'warning';
  if (s === 'CANCELLED' || s === 'FAILED') return 'destructive';
  if (s === 'CHECKED_IN' || s === 'CHECKED_OUT') return 'info';
  return 'muted';
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const nights = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)));

export default function BookingDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();

  useEffect(() => {
    if (!getAccessToken()) router.replace(`/login?next=/dashboard/bookings/${id}`);
  }, [router, id]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['booking', id, token],
    enabled: !!token && !!id,
    queryFn: () => apiJson<BookingDetail>(`/api/v1/bookings/${id}`, { accessToken: token! }),
  });

  const cancelMut = useMutation({
    mutationFn: async () =>
      apiJson<BookingDetail>(`/api/v1/bookings/${id}`, {
        method: 'PATCH',
        accessToken: token!,
        body: JSON.stringify({ action: 'cancel' }),
      }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      void qc.invalidateQueries({ queryKey: ['booking', id] });
      void qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Cancel failed'),
  });

  if (!token) return null;
  if (isPending) return <HotelDetailSkeleton />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState message={(error as Error)?.message ?? 'Not found'} onRetry={() => void refetch()} />
      </div>
    );
  }

  const images = (data.hotel.images as string[] | undefined) ?? [];
  const hero = images[0] ?? 'https://picsum.photos/seed/booking-hero/1200/600';
  const n = nights(data.checkIn, data.checkOut);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to bookings
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="relative aspect-[16/6] w-full">
          <Image src={hero} alt={data.hotel.name} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(data.status)}>{data.status}</Badge>
              {data.payment ? (
                <Badge variant={statusVariant(data.payment.status)}>
                  Payment · {data.payment.status}
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{data.hotel.name}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {data.hotel.city}, {data.hotel.country}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Stay
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-medium">{fmt(data.checkIn)}</span> →{' '}
              <span className="font-medium">{fmt(data.checkOut)}</span>
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              {data.guests} guest{data.guests === 1 ? '' : 's'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Room: <span className="font-medium text-foreground">{data.room.name}</span> ·{' '}
              {data.room.type} · capacity {data.room.capacity}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {n} night{n === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Payment
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden />
              Total{' '}
              <span className="text-xl font-semibold text-foreground">
                ${String(data.totalPrice)}
              </span>
            </p>
            {data.payment ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Status:{' '}
                <span className="font-medium text-foreground">{data.payment.status}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No payment recorded yet.</p>
            )}
          </div>
        </div>

        {data.specialRequests ? (
          <div className="border-t border-border px-6 py-5 dark:border-slate-800">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              Special requests
            </p>
            <p className="mt-2 text-sm text-foreground/85">{data.specialRequests}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-border bg-secondary/40 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/40">
          {data.status === 'PENDING' && (
            <StripeCheckoutButton bookingId={data.id} disabled={cancelMut.isPending} />
          )}
          {(data.status === 'PENDING' || data.status === 'CONFIRMED') && (
            <Link
              href={`/dashboard/bookings/${id}/modify`}
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              Modify dates
            </Link>
          )}
          {(data.status === 'PENDING' || data.status === 'CONFIRMED') && (
            <Button
              variant="destructive"
              type="button"
              disabled={cancelMut.isPending}
              onClick={() => cancelMut.mutate()}
            >
              {cancelMut.isPending ? 'Cancelling…' : 'Cancel booking'}
            </Button>
          )}
          <Link
            href={`/hotels/${data.hotel.slug}`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'ml-auto inline-flex')}
          >
            View hotel →
          </Link>
        </div>
      </div>
    </div>
  );
}
