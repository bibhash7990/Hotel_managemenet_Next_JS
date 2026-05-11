'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Filter, MapPinned, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HotelCard } from '@/components/hotel-card';
import { apiJson } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EmptyState, ErrorState, HotelsGridSkeleton } from '@/components/query-state';
import { HotelsMap } from '@/components/hotels-map';

type HotelsResponse = {
  items: {
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    starRating: number;
    images: string[];
    minPrice: number | null;
    lat?: number | null;
    lng?: number | null;
  }[];
  page: number;
  total: number;
  totalPages: number;
};

export type HotelsSearchInitial = {
  city: string;
  country: string;
  minPrice: string;
  maxPrice: string;
  minStars: string;
  sort: string;
  page: string;
  amenities: string;
  roomType: string;
  rooms: string;
  minReviewAvg: string;
  nearLat: string;
  nearLng: string;
  maxKm: string;
};

const sortOptions: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export function HotelsClient({ initial }: { initial: HotelsSearchInitial }) {
  const router = useRouter();
  const [city, setCity] = useState(initial.city);
  const [country, setCountry] = useState(initial.country);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [minStars, setMinStars] = useState(initial.minStars);
  const [sort, setSort] = useState(initial.sort || 'newest');
  const [page, setPage] = useState(Number(initial.page) || 1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [amenities, setAmenities] = useState(initial.amenities);
  const [roomType, setRoomType] = useState(initial.roomType);
  const [rooms, setRooms] = useState(initial.rooms);
  const [minReviewAvg, setMinReviewAvg] = useState(initial.minReviewAvg);
  const [nearLat, setNearLat] = useState(initial.nearLat);
  const [nearLng, setNearLng] = useState(initial.nearLng);
  const [maxKm, setMaxKm] = useState(initial.maxKm);

  const buildQuery = (pageNum: number, overrides?: { sort?: string }) => {
    const q = new URLSearchParams();
    if (city.trim()) q.set('city', city.trim());
    if (country.trim()) q.set('country', country.trim());
    if (minPrice.trim()) q.set('minPrice', minPrice.trim());
    if (maxPrice.trim()) q.set('maxPrice', maxPrice.trim());
    if (minStars.trim()) q.set('minStars', minStars.trim());
    if (amenities.trim()) q.set('amenities', amenities.trim());
    if (roomType.trim()) q.set('roomType', roomType.trim());
    if (rooms.trim()) q.set('rooms', rooms.trim());
    if (minReviewAvg.trim()) q.set('minReviewAvg', minReviewAvg.trim());
    if (nearLat.trim()) q.set('nearLat', nearLat.trim());
    if (nearLng.trim()) q.set('nearLng', nearLng.trim());
    if (maxKm.trim()) q.set('maxKm', maxKm.trim());
    q.set('sort', overrides?.sort ?? sort);
    q.set('page', String(pageNum));
    q.set('limit', '24');
    return q.toString();
  };

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [
      'hotels',
      city,
      country,
      minPrice,
      maxPrice,
      minStars,
      sort,
      page,
      amenities,
      roomType,
      rooms,
      minReviewAvg,
      nearLat,
      nearLng,
      maxKm,
    ],
    queryFn: () => apiJson<HotelsResponse>(`/api/v1/hotels?${buildQuery(page)}`),
  });

  const apply = () => {
    setPage(1);
    setFiltersOpen(false);
    router.push(`/hotels?${buildQuery(1)}`);
  };

  const reset = () => {
    setCity('');
    setCountry('');
    setMinPrice('');
    setMaxPrice('');
    setMinStars('');
    setSort('newest');
    setPage(1);
    setAmenities('');
    setRoomType('');
    setRooms('');
    setMinReviewAvg('');
    setNearLat('');
    setNearLng('');
    setMaxKm('');
    router.push('/hotels');
  };

  const goPage = (p: number) => {
    setPage(p);
    router.push(`/hotels?${buildQuery(p)}`);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilters = [
    city && { key: 'city', label: `City: ${city}`, clear: () => setCity('') },
    country && { key: 'country', label: `Country: ${country}`, clear: () => setCountry('') },
    minPrice && { key: 'min', label: `From $${minPrice}`, clear: () => setMinPrice('') },
    maxPrice && { key: 'max', label: `To $${maxPrice}`, clear: () => setMaxPrice('') },
    minStars && { key: 'stars', label: `${minStars}+ stars`, clear: () => setMinStars('') },
    amenities && { key: 'amen', label: `Amenities: ${amenities}`, clear: () => setAmenities('') },
    roomType && { key: 'rtype', label: `Room: ${roomType}`, clear: () => setRoomType('') },
    rooms && { key: 'rooms', label: `Rooms: ${rooms}+`, clear: () => setRooms('') },
    minReviewAvg && { key: 'rev', label: `Reviews ≥${minReviewAvg}`, clear: () => setMinReviewAvg('') },
    nearLat && nearLng && maxKm && {
      key: 'near',
      label: `Near (${nearLat},${nearLng}) ${maxKm}km`,
      clear: () => {
        setNearLat('');
        setNearLng('');
        setMaxKm('');
      },
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const filtersForm = (
    <form
      className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
          Filters
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-primary hover:underline"
        >
          Reset all
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hotel-city">City</Label>
        <Input
          id="hotel-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Paris"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hotel-country">Country</Label>
        <Input
          id="hotel-country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="France"
        />
      </div>

      <div>
        <Label>Price range</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Input
            id="min-p"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min $"
          />
          <Input
            id="max-p"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max $"
          />
        </div>
      </div>

      <div>
        <Label>Minimum stars</Label>
        <div className="mt-1.5 grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = String(n) === minStars;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setMinStars(active ? '' : String(n))}
                className={
                  'h-10 rounded-lg border text-sm font-semibold transition-colors ' +
                  (active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-white text-foreground hover:border-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200')
                }
                aria-pressed={active}
              >
                {n}+
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
        <Input
          id="amenities"
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="wifi, pool, parking"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="roomType">Room type contains</Label>
        <Input
          id="roomType"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          placeholder="suite, deluxe…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rooms">Min. distinct room types</Label>
        <Input
          id="rooms"
          inputMode="numeric"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          placeholder="1"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="minReviewAvg">Min. guest review average</Label>
        <Input
          id="minReviewAvg"
          inputMode="decimal"
          value={minReviewAvg}
          onChange={(e) => setMinReviewAvg(e.target.value)}
          placeholder="4"
        />
      </div>
      <div>
        <Label>Near me (optional)</Label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          <Input value={nearLat} onChange={(e) => setNearLat(e.target.value)} placeholder="Lat" />
          <Input value={nearLng} onChange={(e) => setNearLng(e.target.value)} placeholder="Lng" />
          <Input value={maxKm} onChange={(e) => setMaxKm(e.target.value)} placeholder="Km" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sort">Sort by</Label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium text-foreground shadow-soft focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );

  return (
    <div className="bg-subtle-warm pb-16">
      <div className="border-b border-border bg-background/60 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 lg:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <MapPinned className="h-3.5 w-3.5" aria-hidden /> Browse stays
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-serif text-heading-1">Find your next hotel</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Filter by location, price, and stars — save the ones you love when signed in.
              </p>
            </div>
            {data ? (
              <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft dark:border-slate-700 dark:bg-slate-900">
                {data.total.toLocaleString()} stays
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-80 lg:shrink-0" aria-labelledby="filters-heading">
            <h2 id="filters-heading" className="sr-only">
              Filters
            </h2>
            <div className="hidden lg:block lg:sticky lg:top-24">{filtersForm}</div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <Filter className="h-4 w-4" aria-hidden />
                  Filters
                  {activeFilters.length > 0 ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {activeFilters.length}
                    </span>
                  ) : null}
                </Button>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                    router.push(`/hotels?${buildQuery(1, { sort: e.target.value })}`);
                  }}
                  className="h-9 rounded-full border border-border bg-white px-3 text-xs font-medium text-foreground shadow-soft hover:border-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Sort hotels"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {data ? (
                <p className="text-xs text-muted-foreground">
                  Showing {(data.page - 1) * 24 + 1}–{Math.min(data.page * 24, data.total)} of{' '}
                  {data.total.toLocaleString()}
                </p>
              ) : null}
            </div>

            {activeFilters.length > 0 ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      f.clear();
                      setTimeout(apply, 0);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                  >
                    {f.label}
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            ) : null}

            {isPending && <HotelsGridSkeleton />}
            {isError && (
              <ErrorState
                className="mt-4"
                message={(error as Error).message}
                onRetry={() => void refetch()}
              />
            )}
            {data && data.items.length > 0 && (
              <>
                {data.items.some((h) => h.lat != null && h.lng != null) ? (
                  <div className="mb-8">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Map</p>
                    <HotelsMap
                      markers={data.items
                        .filter((h): h is typeof h & { lat: number; lng: number } => h.lat != null && h.lng != null)
                        .map((h) => ({
                          id: h.id,
                          lat: h.lat,
                          lng: h.lng,
                          label: h.name,
                          href: `/hotels/${h.slug}`,
                        }))}
                    />
                  </div>
                ) : null}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map(({ lat: _lat, lng: _lng, ...h }) => (
                    <HotelCard key={h.slug} {...h} />
                  ))}
                </div>
                {data.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={data.page <= 1}
                      onClick={() => goPage(data.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {data.page} <span className="text-foreground/40">/</span> {data.totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={data.page >= data.totalPages}
                      onClick={() => goPage(data.page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                )}
              </>
            )}
            {data && data.items.length === 0 && (
              <EmptyState
                className="mt-6"
                title="No hotels match your filters"
                description="Try widening price or clearing city to see more options."
                action={
                  <Button type="button" variant="secondary" onClick={reset}>
                    Reset filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-background p-5 shadow-elevated animate-slide-up dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-xl">Filters</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersForm}
          </div>
        </div>
      ) : null}
    </div>
  );
}
