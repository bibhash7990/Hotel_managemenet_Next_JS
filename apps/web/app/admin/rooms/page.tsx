'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { AdminDataTable } from '@/components/admin/data-table';
import { ErrorState } from '@/components/query-state';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

type Room = {
  id: string;
  name: string;
  type: string;
  pricePerNight: unknown;
  hotel: { name: string; slug: string };
};

export default function AdminRoomsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/rooms`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-rooms', token, page],
    enabled: !!token,
    queryFn: () =>
      apiJson<{ items: Room[]; totalPages: number }>(`/api/v1/admin/rooms?page=${page}&limit=20`, {
        accessToken: token!,
      }),
  });

  if (!token) return null;

  const isManagerPanel = staffBase === '/manager';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Rooms"
        description={
          isManagerPanel
            ? 'Room types for your hotels only (inventory you own).'
            : 'Paginated inventory across all hotels on the platform.'
        }
      />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {isError && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && (
        <>
          <AdminDataTable
            className="mt-6"
            columns={['Room', 'Type', 'Hotel', 'Price/night']}
            rows={data.items.map((r) => [r.name, r.type, r.hotel.name, `$${String(r.pricePerNight)}`])}
          />
          {data.totalPages > 1 && (
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="self-center text-sm text-muted-foreground">
                Page {page} / {data.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
