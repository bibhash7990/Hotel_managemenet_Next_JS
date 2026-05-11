'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  Users,
  Wifi,
} from 'lucide-react';
import { apiJson } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorState, HotelDetailSkeleton } from '@/components/query-state';
import { WishlistToggle } from '@/components/wishlist-toggle';
import { useBookingStore } from '@/stores/booking-store';
import { getAccessToken } from '@/lib/auth-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Hotel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  country: string;
  starRating: number;
  images: string[];
  rooms: {
    id: string;
    name: string;
    type: string;
    pricePerNight: unknown;
    capacity: number;
  }[];
};

type Review = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt?: string;
};

type CalendarResp = { dates: { date: string; available: boolean; availableUnits: number }[] };

const HIGHLIGHTS = [
  { icon: Wifi, label: 'Free Wi-Fi' },
  { icon: BedDouble, label: 'Premium bedding' },
  { icon: Sparkles, label: 'Daily housekeeping' },
  { icon: CheckCircle2, label: 'Free cancellation*' },
];

export function HotelDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const setDraft = useBookingStore((s) => s.setDraft);
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [calStart, setCalStart] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['hotel', slug],
    queryFn: () => apiJson<Hotel>(`/api/v1/hotels/${encodeURIComponent(slug)}`),
  });

  const firstRoomId = data?.rooms[0]?.id ?? null;
  const roomForCal = selectedRoomId ?? firstRoomId;

  const { data: calData } = useQuery({
    queryKey: ['hotel-cal', slug, roomForCal, calStart],
    enabled: !!data && !!roomForCal,
    queryFn: () =>
      apiJson<CalendarResp>(
        `/api/v1/hotels/${encodeURIComponent(slug)}/calendar?roomId=${roomForCal}&start=${calStart}&nights=42`
      ),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', data?.id],
    enabled: !!data?.id,
    queryFn: () => apiJson<{ items: Review[] }>(`/api/v1/reviews/hotel/${data!.id}`),
  });

  const images = useMemo(
    () => (data?.images?.length ? data.images : ['https://picsum.photos/seed/hotel/1200/700']),
    [data]
  );

  if (isPending) return <HotelDetailSkeleton />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState
          message={(error as Error)?.message ?? 'Hotel could not be loaded.'}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const stars = Math.max(0, Math.min(5, Math.round(data.starRating)));
  const minPrice = data.rooms.reduce<number | null>((acc, r) => {
    const n = Number(r.pricePerNight);
    if (!Number.isFinite(n)) return acc;
    return acc == null ? n : Math.min(acc, n);
  }, null);
  const avgReview =
    reviewsData && reviewsData.items.length > 0
      ? reviewsData.items.reduce((s, r) => s + r.rating, 0) / reviewsData.items.length
      : null;

  const goBook = (roomId: string) => {
    setDraft({ hotelSlug: data.slug, roomId });
    router.push('/book');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:pb-16 lg:px-8">
      <nav className="mb-4 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/hotels" className="hover:text-foreground">
              Hotels
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">{data.name}</li>
        </ol>
      </nav>

      <div className="relative">
        <div className="hidden gap-2 sm:grid sm:grid-cols-4 sm:grid-rows-2">
          <button
            type="button"
            onClick={() => setImgIdx(0)}
            className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={images[0]}
                alt={`${data.name} — main`}
                fill
                priority
                sizes="50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </button>
          {[1, 2, 3, 4].map((idx) => {
            const src = images[idx] ?? images[idx % images.length];
            const showMore = idx === 4 && images.length > 5;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setImgIdx(idx % images.length)}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-square">
                  <Image
                    src={src}
                    alt={`${data.name} — photo ${idx + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {showMore ? (
                  <span className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-medium text-white">
                    +{images.length - 5} more
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:hidden">
          <Image
            src={images[imgIdx] ?? images[0]}
            alt={`${data.name} — photo ${imgIdx + 1} of ${images.length}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground shadow-soft hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground shadow-soft hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                {imgIdx + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="warning">{data.starRating}-star property</Badge>
                {avgReview ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                    {avgReview.toFixed(1)}
                    <span className="text-muted-foreground">
                      ({reviewsData?.items.length} reviews)
                    </span>
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 font-serif text-heading-1">{data.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {data.city}, {data.country}
              </p>
            </div>
            <WishlistToggle
              hotelId={data.id}
              hotelSummary={{
                name: data.name,
                slug: data.slug,
                city: data.city,
                country: data.country,
                images: data.images as string[],
              }}
              className="h-11 w-11 rounded-full border border-border bg-card text-foreground hover:text-destructive"
            />
          </div>

          <div className="mt-6 flex items-center gap-1 text-amber-500" aria-label={`${stars} of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < stars
                    ? 'h-4 w-4 fill-current'
                    : 'h-4 w-4 text-amber-200 dark:text-slate-700'
                }
                aria-hidden
              />
            ))}
          </div>

          <p className="mt-6 text-pretty text-base leading-relaxed text-foreground/85 dark:text-slate-200">
            {data.description}
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>

          <section className="mt-12" aria-labelledby="rooms-heading">
            <div className="flex items-end justify-between">
              <h2 id="rooms-heading" className="font-serif text-heading-2">
                Rooms & rates
              </h2>
              <span className="text-sm text-muted-foreground">
                {data.rooms.length} room{data.rooms.length === 1 ? '' : 's'}
              </span>
            </div>
            {data.rooms.length === 0 ? (
              <p className="mt-4 text-muted-foreground dark:text-slate-400">
                No rooms are listed for this hotel yet.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {data.rooms.map((r, i) => {
                  const isSelected = (selectedRoomId ?? firstRoomId) === r.id;
                  const roomImg = images[(i + 1) % images.length] ?? images[0];
                  return (
                    <li
                      key={r.id}
                      className={
                        'overflow-hidden rounded-2xl border bg-card shadow-soft transition-all dark:bg-slate-900 ' +
                        (isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/40 hover:shadow-elevated dark:border-slate-800')
                      }
                    >
                      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                          <Image
                            src={roomImg}
                            alt={`${r.name} preview`}
                            fill
                            sizes="(max-width:640px) 100vw, 176px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold leading-tight">{r.name}</p>
                          <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="muted">{r.type}</Badge>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" aria-hidden />
                              up to {r.capacity} guests
                            </span>
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Free cancellation up to 24h before check-in.
                          </p>
                        </div>
                        <div className="flex flex-col items-stretch gap-2 sm:items-end">
                          <p className="text-right">
                            <span className="text-2xl font-semibold text-foreground">
                              ${String(r.pricePerNight)}
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">/ night</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRoomId(r.id)}
                            >
                              View calendar
                            </Button>
                            <Link
                              href={`/hotels/${data.slug}/rooms/${r.id}`}
                              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex')}
                            >
                              Room details
                            </Link>
                            <Button type="button" size="sm" onClick={() => goBook(r.id)}>
                              Reserve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {roomForCal && (
            <section id="availability" className="mt-12 scroll-mt-24" aria-labelledby="cal-heading">
              <h2 id="cal-heading" className="font-serif text-heading-2">
                Availability
              </h2>
              <div className="mt-4 max-w-xs">
                <Label htmlFor="cal-start">Start from</Label>
                <Input
                  id="cal-start"
                  type="date"
                  className="mt-1.5"
                  value={calStart}
                  onChange={(e) => setCalStart(e.target.value)}
                />
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-success/20 ring-1 ring-success/40" />
                  Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-muted ring-1 ring-border" />
                  Sold out
                </span>
              </div>
              {calData && (
                <ul className="mt-4 grid max-h-72 grid-cols-7 gap-1.5 overflow-y-auto rounded-2xl border border-border bg-card p-3 text-center text-xs shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  {calData.dates.map((d) => (
                    <li
                      key={d.date}
                      className={
                        'rounded-lg px-1 py-2 font-medium ring-1 ' +
                        (d.available
                          ? 'bg-success/12 text-success ring-success/25 dark:bg-success/20'
                          : 'bg-muted text-muted-foreground ring-border')
                      }
                      title={`${d.date} — ${d.availableUnits} units`}
                    >
                      {d.date.slice(5)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="mt-12" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="font-serif text-heading-2">
              Guest reviews
            </h2>
            {reviewsData && reviewsData.items.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">No published reviews yet.</p>
            )}
            {reviewsData && reviewsData.items.length > 0 && (
              <ul className="mt-5 space-y-3">
                {reviewsData.items.map((rev) => (
                  <li
                    key={rev._id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                      ))}
                    </div>
                    <p className="mt-2 font-semibold">{rev.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{rev.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            {token ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Submit a review from your dashboard after a completed stay (requires completed booking).
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>{' '}
                to leave a review after your stay.
              </p>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-elevated dark:border-slate-800 dark:bg-slate-900">
            {minPrice != null ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Starting from
                </p>
                <p className="mt-1">
                  <span className="font-serif text-3xl font-semibold">${minPrice}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ night</span>
                </p>
              </div>
            ) : (
              <p className="font-medium">Contact for rates</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Taxes and fees calculated at checkout
            </p>
            <div className="my-5 h-px bg-border dark:bg-slate-800" />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Real availability locked at checkout
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Secure Stripe payment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Instant confirmation by email
              </li>
            </ul>
            <Button
              type="button"
              size="lg"
              className="mt-6 w-full"
              disabled={!data.rooms[0]}
              onClick={() => {
                const rid = selectedRoomId ?? firstRoomId;
                if (rid) goBook(rid);
              }}
            >
              Reserve now
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You won’t be charged yet
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-elevated backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{data.name}</p>
            {minPrice != null ? (
              <p className="truncate text-base font-semibold">
                ${minPrice}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ night</span>
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            disabled={!data.rooms[0]}
            onClick={() => {
              const rid = selectedRoomId ?? firstRoomId;
              if (rid) goBook(rid);
            }}
          >
            Reserve
          </Button>
        </div>
      </div>
    </div>
  );
}
