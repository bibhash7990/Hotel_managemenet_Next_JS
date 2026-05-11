import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Popular destinations',
  description: 'Explore cities where StayHub has active hotels — tap through to live availability.',
};

type DestinationsResponse = {
  items: { city: string; country: string; hotelCount: number; coverImage: string | null }[];
};

async function fetchDestinations(): Promise<DestinationsResponse | null> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/v1/hotels/destinations`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as DestinationsResponse;
  } catch {
    return null;
  }
}

export default async function DestinationsPage() {
  const data = await fetchDestinations();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Discover"
        title="Popular destinations"
        description="Every card links to live search for that city — same availability engine as the main hotel list."
      />

      {!data?.items?.length ? (
        <div className="mt-10 rounded-lg border border-border bg-muted/40 px-6 py-10 text-center text-muted-foreground">
          <p>We couldn’t load destinations right now.</p>
          <Link
            href="/hotels"
            className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse all hotels
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((d) => {
            const href = `/hotels?city=${encodeURIComponent(d.city)}&country=${encodeURIComponent(d.country)}`;
            return (
              <li key={`${d.city}-${d.country}`}>
                <Link
                  href={href}
                  className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    {d.coverImage ? (
                      <Image
                        src={d.coverImage}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <MapPin className="h-10 w-10 opacity-40" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-lg font-semibold text-foreground group-hover:text-primary">
                      {d.city}
                    </p>
                    <p className="text-sm text-muted-foreground">{d.country}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {d.hotelCount} {d.hotelCount === 1 ? 'property' : 'properties'}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
