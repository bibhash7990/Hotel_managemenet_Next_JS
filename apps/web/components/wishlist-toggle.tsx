'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export type WishlistHotelSummary = {
  name: string;
  slug: string;
  city: string;
  country: string;
  images: string[];
};

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
    };
  }[];
};

type WishlistToggleProps = {
  hotelId: string;
  hotelSummary?: WishlistHotelSummary;
  className?: string;
};

const baseClass =
  'interactive inline-flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-full text-foreground/80 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function WishlistToggle({ hotelId, hotelSummary, className }: WishlistToggleProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(getAccessToken());
  }, [pathname]);
  const loginNext = encodeURIComponent(pathname && pathname !== '/' ? pathname : '/hotels');

  const { data } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: () => apiJson<WishlistResponse>('/api/v1/wishlist', { accessToken: token! }),
    enabled: !!token,
  });

  const isSaved = data?.items.some((i) => i.hotel.id === hotelId) ?? false;

  const mutation = useMutation({
    mutationFn: () =>
      apiJson<{ saved: boolean }>(`/api/v1/wishlist/${encodeURIComponent(hotelId)}`, {
        method: 'POST',
        accessToken: token!,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', token] });
      const previous = queryClient.getQueryData<WishlistResponse>(['wishlist', token]);
      if (!previous) return { previous };

      const exists = previous.items.some((i) => i.hotel.id === hotelId);
      if (exists) {
        queryClient.setQueryData<WishlistResponse>(['wishlist', token], {
          items: previous.items.filter((i) => i.hotel.id !== hotelId),
        });
      } else if (hotelSummary) {
        queryClient.setQueryData<WishlistResponse>(['wishlist', token], {
          items: [
            ...previous.items,
            { id: `optimistic-${hotelId}`, hotel: { id: hotelId, ...hotelSummary } },
          ],
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(['wishlist', token], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
    },
  });

  if (!token) {
    return (
      <Link
        href={`/login?next=${loginNext}`}
        className={cn(baseClass, className)}
        aria-label="Log in to save this hotel to your wishlist"
      >
        <Heart className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  const label = isSaved ? 'Remove from wishlist' : 'Save to wishlist';

  return (
    <button
      type="button"
      className={cn(
        baseClass,
        isSaved && 'text-destructive',
        mutation.isPending && 'opacity-60',
        className
      )}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <Heart
        className="h-4 w-4 transition-transform"
        fill={isSaved ? 'currentColor' : 'none'}
        aria-hidden
      />
    </button>
  );
}
