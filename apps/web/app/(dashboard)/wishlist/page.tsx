'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { HotelCard } from '@/components/hotel-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, HotelsGridSkeleton } from '@/components/query-state';

type WishlistResponse = {
  items: {
    id: string;
    hotel: {
      id: string;
      name: string;
      slug: string;
      city: string;
      country: string;
      images: string[];
      starRating: number;
    };
  }[];
  page: number;
  total: number;
  totalPages: number;
};

export default function WishlistPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login?next=/wishlist');
  }, [router]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['wishlist', token, page],
    enabled: !!token,
    queryFn: () =>
      apiJson<WishlistResponse>(`/api/v1/wishlist?page=${page}&limit=12`, { accessToken: token! }),
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Saved for later"
        title="Wishlist"
        description="Hotels you've saved — pick up where you left off when you're ready to book."
      />

      <div className="mt-8">
        {isPending && <HotelsGridSkeleton />}
        {isError && (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        )}
        {data && data.items.length === 0 && (
          <EmptyState
            icon={Heart}
            title="No saved hotels yet"
            description="Tap the heart on any hotel card to add it here. We'll keep your list synced across devices."
            action={
              <Link
                href="/hotels"
                className={cn(buttonVariants({ variant: 'default' }), 'inline-flex')}
              >
                Browse hotels
              </Link>
            }
          />
        )}
        {data && data.items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((w) => (
                <HotelCard
                  key={w.id}
                  id={w.hotel.id}
                  slug={w.hotel.slug}
                  name={w.hotel.name}
                  city={w.hotel.city}
                  country={w.hotel.country}
                  images={w.hotel.images}
                  starRating={w.hotel.starRating}
                  minPrice={null}
                />
              ))}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page} <span className="text-foreground/40">/</span> {data.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
