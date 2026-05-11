import type { Metadata } from 'next';
import { HotelDetail } from './ui';
import { buildHotelJsonLd } from '@/lib/seo/hotel-json-ld';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: params.slug.replace(/-/g, ' ') };
}

async function fetchHotelJson(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const res = await fetch(`${base}/api/v1/hotels/${encodeURIComponent(slug)}`, { next: { revalidate: 120 } });
  if (!res.ok) return null;
  return res.json() as Promise<{
    name: string;
    description: string;
    slug: string;
    city: string;
    country: string;
    images?: string[];
  }>;
}

export default async function HotelDetailPage({ params }: Props) {
  const hotel = await fetchHotelJson(params.slug);
  const jsonLd = hotel
    ? buildHotelJsonLd({
        name: hotel.name,
        description: hotel.description,
        slug: hotel.slug,
        city: hotel.city,
        country: hotel.country,
        images: hotel.images,
      })
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <HotelDetail slug={params.slug} />
    </>
  );
}
