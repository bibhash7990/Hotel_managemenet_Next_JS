import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { WishlistToggle, type WishlistHotelSummary } from '@/components/wishlist-toggle';

export type HotelCardProps = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  images: string[];
  minPrice: number | null;
};

const FALLBACK = 'https://picsum.photos/seed/fallback/800/600';

export function HotelCard({
  id,
  slug,
  name,
  city,
  country,
  starRating,
  images,
  minPrice,
}: HotelCardProps) {
  const img = images[0] ?? FALLBACK;
  const alt = `${name} — exterior or room preview in ${city}, ${country}`;
  const summary: WishlistHotelSummary = { name, slug, city, country, images };
  const stars = Math.max(0, Math.min(5, Math.round(starRating)));

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900">
      <Link
        href={`/hotels/${slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={img}
            alt={alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
          {stars >= 4 ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-soft backdrop-blur dark:bg-slate-900/90 dark:text-slate-50">
              <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
              Top rated
            </span>
          ) : null}
        </div>

        <div className="space-y-2 p-5">
          <div className="flex items-center gap-1 text-amber-500" aria-label={`${stars} of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < stars
                    ? 'h-3.5 w-3.5 fill-current text-amber-500'
                    : 'h-3.5 w-3.5 text-amber-200 dark:text-slate-700'
                }
                aria-hidden
              />
            ))}
          </div>
          <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
            {name}
          </h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <span className="truncate">
              {city}, {country}
            </span>
          </p>
          <div className="flex items-end justify-between border-t border-border/60 pt-3 dark:border-slate-800">
            {minPrice != null ? (
              <p className="text-sm text-muted-foreground">
                <span className="text-xs uppercase tracking-wide">From</span>{' '}
                <span className="text-lg font-semibold text-foreground dark:text-slate-50">
                  ${minPrice}
                </span>{' '}
                <span className="text-xs">/ night</span>
              </p>
            ) : (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Contact for rates
              </p>
            )}
            <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View →
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <WishlistToggle
          hotelId={id}
          hotelSummary={summary}
          className="h-9 w-9 min-h-9 min-w-9 rounded-full border border-white/40 bg-white/90 text-foreground shadow-soft backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
        />
      </div>
    </article>
  );
}
