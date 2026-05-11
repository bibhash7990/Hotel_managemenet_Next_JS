import { Suspense } from 'react';
import { HotelsClient } from './ui';

export const metadata = {
  title: 'Hotels',
};

export default function HotelsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const g = (k: string) => (typeof searchParams[k] === 'string' ? (searchParams[k] as string) : '');
  const initial = {
    city: g('city'),
    country: g('country'),
    minPrice: g('minPrice'),
    maxPrice: g('maxPrice'),
    minStars: g('minStars'),
    sort: g('sort') || 'newest',
    page: g('page') || '1',
    amenities: g('amenities'),
    roomType: g('roomType'),
    rooms: g('rooms'),
    minReviewAvg: g('minReviewAvg'),
    nearLat: g('nearLat'),
    nearLng: g('nearLng'),
    maxKm: g('maxKm'),
  };
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-500">Loading hotels…</p>}>
      <HotelsClient initial={initial} />
    </Suspense>
  );
}
