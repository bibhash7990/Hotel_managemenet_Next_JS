'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hotel as HotelIcon,
  Loader2,
  MapPin,
  Receipt,
  Users,
} from 'lucide-react';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BookingDetail = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: unknown;
  hotel: { name: string; slug: string; city: string };
  room: { name: string };
  payment: { status: string } | null;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function ConfirmationInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [data, setData] = useState<{ booking: BookingDetail; paymentStatus: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !sessionId) {
      setErr(!token ? 'Please sign in to view your confirmation.' : 'Missing payment session.');
      return;
    }
    void (async () => {
      try {
        const res = await apiJson<{ booking: BookingDetail; paymentStatus: string }>(
          `/api/v1/bookings/checkout-session/${encodeURIComponent(sessionId)}`,
          { accessToken: token }
        );
        setData(res);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : 'Could not load confirmation.');
      }
    })();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Invalid link</AlertTitle>
          <AlertDescription>Open this page from the Stripe success redirect.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'primary' }), 'mt-6 inline-flex')}
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 px-4 py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <p>Loading confirmation…</p>
      </div>
    );
  }

  const b = data.booking;
  const ref = b.id.slice(-8).toUpperCase();
  const confirmed = b.status === 'CONFIRMED';

  return (
    <div className="bg-subtle-warm pb-16 pt-10 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 lg:px-8">
        <div className="text-center">
          <span
            className={cn(
              'inline-grid h-20 w-20 place-items-center rounded-full shadow-elevated animate-fade-in',
              confirmed ? 'bg-success text-success-foreground' : 'bg-accent text-accent-foreground'
            )}
            aria-hidden
          >
            {confirmed ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <Loader2 className="h-10 w-10 animate-spin" />
            )}
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
            {confirmed ? 'Booking confirmed' : 'Almost there'}
          </p>
          <h1 className="mt-2 font-serif text-display leading-tight">
            {confirmed ? 'Your trip is booked.' : 'Processing your payment…'}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {confirmed
              ? 'A confirmation email is on its way. You can manage everything from your dashboard.'
              : 'We’re finalising your payment with Stripe — this usually takes just a few seconds.'}
          </p>
        </div>

        <Card className="mt-10">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Reservation
                </p>
                <p className="mt-1 font-mono text-sm font-medium">#{ref}</p>
              </div>
              <Badge variant={confirmed ? 'success' : 'warning'}>{b.status}</Badge>
            </div>

            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary dark:bg-slate-800">
                  <HotelIcon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Hotel</p>
                  <p className="mt-0.5 font-medium">{b.hotel.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden /> {b.hotel.city}
                  </p>
                  <p className="mt-1 text-muted-foreground">Room: {b.room.name}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary dark:bg-slate-800">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Dates</p>
                  <p className="mt-0.5 font-medium">
                    {fmt(b.checkIn)} → {fmt(b.checkOut)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" aria-hidden /> {b.guests} guest
                    {b.guests === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-success/15 text-success">
                  <CreditCard className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Payment</p>
                  <p className="mt-0.5 font-medium">${String(b.totalPrice)} total</p>
                  <p className="mt-0.5 capitalize text-muted-foreground">
                    {data.paymentStatus.replace(/_/g, ' ')}
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/dashboard/bookings/${b.id}`}
            className={cn(buttonVariants({ variant: 'primary' }), 'inline-flex')}
          >
            <Receipt className="h-4 w-4" aria-hidden /> View booking details
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
          >
            All bookings
          </Link>
          <Link
            href="/hotels"
            className={cn(buttonVariants({ variant: 'ghost' }), 'inline-flex')}
          >
            Plan another trip
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 px-4 py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <p>Loading…</p>
        </div>
      }
    >
      <ConfirmationInner />
    </Suspense>
  );
}
