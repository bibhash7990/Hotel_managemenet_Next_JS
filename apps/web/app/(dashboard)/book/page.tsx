'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Hotel,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/page-header';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { useBookingStore } from '@/stores/booking-store';
import { StripeCheckoutButton } from '@/components/booking/stripe-checkout-button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  checkIn: z.string().min(1, 'Check-in is required'),
  checkOut: z.string().min(1, 'Check-out is required'),
  guests: z.coerce.number().min(1).max(20),
  guestName: z.string().min(1, 'Guest name is required').max(200),
  guestEmail: z.string().email('Valid email required').max(320),
  guestPhone: z.string().max(40).optional(),
  specialRequests: z.string().max(2000).optional(),
});

type Form = z.infer<typeof schema>;

const steps = [
  { label: 'Dates', icon: CalendarDays },
  { label: 'Guests', icon: User },
  { label: 'Review', icon: ShieldCheck },
  { label: 'Pay', icon: CreditCard },
] as const;

const fmt = (s?: string) =>
  s
    ? new Date(s).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function BookPage() {
  const router = useRouter();
  const { roomId, hotelSlug, setDraft } = useBookingStore();
  const [step, setStep] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2 },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('cancelled') === '1') {
      toast.message('Checkout cancelled', {
        description: 'You can try payment again when ready.',
      });
    }
  }, []);

  const createMut = useMutation({
    mutationFn: async (values: Form) => {
      if (!roomId) throw new Error('Select a room from a hotel page first.');
      const token = getAccessToken();
      if (!token) {
        router.push('/login?next=/book');
        throw new Error('Please log in');
      }
      const checkIn = new Date(values.checkIn).toISOString();
      const checkOut = new Date(values.checkOut).toISOString();
      return apiJson<{ id: string }>('/api/v1/bookings', {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify({
          roomId,
          checkIn,
          checkOut,
          guests: values.guests,
          guestName: values.guestName,
          guestEmail: values.guestEmail,
          guestPhone: values.guestPhone || undefined,
          specialRequests: values.specialRequests || undefined,
        }),
      });
    },
    onSuccess: (b) => {
      setBookingId(b.id);
      toast.success('Booking created — proceed to payment');
      setStep(3);
    },
    onError: (e) => {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error((e as Error).message);
    },
  });

  const formErrors = form.formState.errors;
  const checkIn = form.watch('checkIn');
  const checkOut = form.watch('checkOut');
  const guests = form.watch('guests');
  const guestName = form.watch('guestName');
  const guestEmail = form.watch('guestEmail');
  const guestPhone = form.watch('guestPhone');
  const specialRequests = form.watch('specialRequests');
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(diff));
  }, [checkIn, checkOut]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 lg:px-8">
      <Link
        href={hotelSlug ? `/hotels/${hotelSlug}` : '/hotels'}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to hotel
      </Link>

      <PageHeader
        className="mt-6"
        eyebrow="Reservation"
        title="Complete your booking"
        description="Pick dates, add guest details, review, then pay securely with Stripe Checkout."
      />

      <ol
        className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900"
        aria-label="Booking steps"
      >
        {steps.map(({ label, icon: Icon }, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active && 'bg-primary text-primary-foreground shadow-soft',
                done && !active && 'text-success',
                !active && !done && 'text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-xs',
                  active && 'bg-white/20 text-current',
                  done && !active && 'bg-success text-success-foreground',
                  !active && !done && 'bg-muted text-muted-foreground'
                )}
                aria-hidden
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">
                {i + 1}/{steps.length}
              </span>
            </li>
          );
        })}
      </ol>

      {!roomId && (
        <Alert variant="warning" className="mt-6">
          <AlertTitle>No room selected</AlertTitle>
          <AlertDescription>
            Choose a room on a hotel page first, then return here to finish your reservation.
          </AlertDescription>
          <div className="mt-3">
            <Link href="/hotels" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
              Browse hotels
            </Link>
          </div>
        </Alert>
      )}

      {roomId ? (
        <Card className="mt-6">
          <CardContent className="flex items-start gap-3 pt-6 text-sm">
            <Hotel className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-muted-foreground">
              You’re booking the room you selected
              {hotelSlug ? (
                <>
                  {' '}
                  from{' '}
                  <Link
                    href={`/hotels/${hotelSlug}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {hotelSlug.replace(/-/g, ' ')}
                  </Link>
                </>
              ) : null}
              . Cancellation up to 24h before check-in.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {step === 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await form.trigger(['checkIn', 'checkOut', 'guests']);
                if (!ok) return;
                const v = form.getValues();
                setDraft({ checkIn: v.checkIn, checkOut: v.checkOut, guests: v.guests });
                setStep(1);
              }}
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="checkIn">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Check-in
                  </Label>
                  <Input
                    id="checkIn"
                    type="date"
                    min={todayISO()}
                    aria-invalid={!!formErrors.checkIn}
                    {...form.register('checkIn')}
                  />
                  {formErrors.checkIn && (
                    <p className="text-xs text-destructive" role="alert">
                      {formErrors.checkIn.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkOut">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Check-out
                  </Label>
                  <Input
                    id="checkOut"
                    type="date"
                    min={checkIn || todayISO()}
                    aria-invalid={!!formErrors.checkOut}
                    {...form.register('checkOut')}
                  />
                  {formErrors.checkOut && (
                    <p className="text-xs text-destructive" role="alert">
                      {formErrors.checkOut.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guests">
                  <Users className="h-3.5 w-3.5" aria-hidden /> Guests
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={20}
                  aria-invalid={!!formErrors.guests}
                  {...form.register('guests')}
                />
                {formErrors.guests && (
                  <p className="text-xs text-destructive" role="alert">
                    {formErrors.guests.message}
                  </p>
                )}
              </div>
              {nights > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {nights} night{nights === 1 ? '' : 's'} selected
                </p>
              ) : null}
              <Button type="submit" size="lg" disabled={!roomId}>
                Continue to guest details
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="mt-6">
          <CardContent className="space-y-5 pt-6">
            <p className="font-serif text-2xl">Guest details</p>
            <p className="text-sm text-muted-foreground">
              Primary guest for this reservation — confirmation is sent here.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="guestName">Full name</Label>
              <Input id="guestName" autoComplete="name" aria-invalid={!!formErrors.guestName} {...form.register('guestName')} />
              {formErrors.guestName && (
                <p className="text-xs text-destructive" role="alert">
                  {formErrors.guestName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                autoComplete="email"
                aria-invalid={!!formErrors.guestEmail}
                {...form.register('guestEmail')}
              />
              {formErrors.guestEmail && (
                <p className="text-xs text-destructive" role="alert">
                  {formErrors.guestEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guestPhone">Phone (optional)</Label>
              <Input id="guestPhone" type="tel" autoComplete="tel" {...form.register('guestPhone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialRequests">Special requests (optional)</Label>
              <textarea
                id="specialRequests"
                rows={3}
                className={cn(
                  'flex min-h-[100px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-soft transition-shadow placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'
                )}
                {...form.register('specialRequests')}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const ok = await form.trigger(['guestName', 'guestEmail', 'guestPhone', 'specialRequests']);
                  if (ok) setStep(2);
                }}
              >
                Continue to review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="font-serif text-2xl">Review your stay</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Double-check the details before we lock in availability.
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary/60 p-4 dark:bg-slate-800/60">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Check-in</dt>
                <dd className="mt-1 text-base font-medium">{fmt(checkIn)}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4 dark:bg-slate-800/60">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Check-out</dt>
                <dd className="mt-1 text-base font-medium">{fmt(checkOut)}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4 dark:bg-slate-800/60">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Guests</dt>
                <dd className="mt-1 text-base font-medium">{guests ?? 1}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4 dark:bg-slate-800/60">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Nights</dt>
                <dd className="mt-1 text-base font-medium">{nights}</dd>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4 sm:col-span-2 dark:bg-slate-800/60">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Lead guest</dt>
                <dd className="mt-1 text-base font-medium">
                  {guestName} · {guestEmail}
                  {guestPhone ? ` · ${guestPhone}` : ''}
                </dd>
                {specialRequests ? (
                  <p className="mt-2 text-sm text-muted-foreground">Requests: {specialRequests}</p>
                ) : null}
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={createMut.isPending || !roomId}
                onClick={() => void createMut.mutate(form.getValues())}
              >
                {createMut.isPending ? 'Creating…' : 'Confirm & continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && bookingId && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Alert variant="success">
              <AlertTitle>Ready for payment</AlertTitle>
              <AlertDescription>
                You’ll be redirected to Stripe Checkout. After paying, you’ll come back to a
                confirmation page with your booking reference.
              </AlertDescription>
            </Alert>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> 256-bit Stripe-secured
                payments
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Instant confirmation
                by email
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Free cancellation up
                to 24 hours before check-in
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <StripeCheckoutButton bookingId={bookingId} size="lg" />
              <Link
                href={`/dashboard/bookings/${bookingId}`}
                className={cn(buttonVariants({ variant: 'ghost' }), 'inline-flex')}
              >
                View booking details
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
