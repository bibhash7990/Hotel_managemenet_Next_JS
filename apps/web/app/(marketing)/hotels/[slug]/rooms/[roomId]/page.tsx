import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { RoomReserveButton } from '@/components/room-reserve-button';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ApiRoom = {
  hotel: {
    id: string;
    name: string;
    slug: string;
    city: string;
    country: string;
    lat?: number | null;
    lng?: number | null;
    images: string[];
  };
  room: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    pricePerNight: unknown;
    capacity: number;
    beds: number;
  };
};

export default async function HotelRoomPage({ params }: { params: { slug: string; roomId: string } }) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const url = `${base}/api/v1/hotels/${encodeURIComponent(params.slug)}/rooms/${encodeURIComponent(params.roomId)}`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) notFound();
  const d = (await res.json()) as ApiRoom;
  const img = d.hotel.images[0] ?? 'https://picsum.photos/seed/room/1200/700';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/hotels" className="hover:text-foreground">
              Hotels
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/hotels/${d.hotel.slug}`} className="hover:text-foreground">
              {d.hotel.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">{d.room.name}</li>
        </ol>
      </nav>

      <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-soft dark:border-slate-800">
        <Image src={img} alt={d.room.name} fill className="object-cover" sizes="(max-width:896px) 100vw, 896px" priority />
      </div>

      <PageHeader
        eyebrow={d.room.type}
        title={d.room.name}
        description={`${d.hotel.name} · ${d.hotel.city}, ${d.hotel.country}`}
      />

      {d.room.description ? (
        <p className="mt-4 text-muted-foreground dark:text-slate-300">{d.room.description}</p>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">From</dt>
          <dd className="mt-1 text-2xl font-semibold">${String(d.room.pricePerNight)}</dd>
          <dd className="text-xs text-muted-foreground">per night</dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Capacity</dt>
          <dd className="mt-1 text-lg font-medium">Up to {d.room.capacity} guests</dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Beds</dt>
          <dd className="mt-1 text-lg font-medium">{d.room.beds}</dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap gap-3">
        <RoomReserveButton hotelSlug={d.hotel.slug} roomId={d.room.id} />
        <Link href={`/hotels/${d.hotel.slug}#availability`} className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}>
          View availability on hotel page
        </Link>
      </div>
    </div>
  );
}
