import { Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { HotelsClient } from '../hotels/ui';

export const metadata = {
  title: 'Last-minute deals',
  description:
    'Value-forward stays sorted by price — filtered to well-reviewed hotels when possible.',
};

export default function DealsPage({
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
    sort: g('sort') || 'price_asc',
    page: g('page') || '1',
    amenities: g('amenities'),
    roomType: g('roomType'),
    rooms: g('rooms'),
    minReviewAvg: g('minReviewAvg') || '4',
    nearLat: g('nearLat'),
    nearLng: g('nearLng'),
    maxKm: g('maxKm'),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Deals"
        title="Last-minute deals and value stays"
        description="We start from lowest nightly rates and require at least a 4★ average guest rating so the list stays useful. Adjust filters anytime — it’s the same search as Browse hotels."
        actions={
          <Button variant="outline" asChild>
            <Link href="/hotels">All hotels</Link>
          </Button>
        }
      />

      <Suspense fallback={<p className="mt-8 text-center text-muted-foreground">Loading deals…</p>}>
        <HotelsClient initial={initial} />
      </Suspense>
    </div>
  );
}
