'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Row = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  totalPrice: unknown;
  user: { email: string };
  hotel: { name: string };
  room: { name: string };
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const qc = useQueryClient();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/bookings`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-bookings', token, page],
    enabled: !!token,
    queryFn: () =>
      apiJson<{ items: Row[]; totalPages: number }>(`/api/v1/admin/bookings?page=${page}&limit=20`, {
        accessToken: token!,
      }),
  });

  const refundMut = useMutation({
    mutationFn: (id: string) =>
      apiJson<{ refundId: string }>(`/api/v1/admin/bookings/${id}/refund`, {
        method: 'POST',
        accessToken: token!,
      }),
    onSuccess: () => {
      toast.success('Refund processed');
      void qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Bookings" description="Operational list with status and guest email." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {isError && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && (
        <>
          <AdminDataTable
            className="mt-6"
            columns={['ID', 'Guest', 'Hotel', 'Room', 'Dates', 'Total', 'Status', 'Actions']}
            rows={data.items.map((b) => [
              <span key={b.id} className="font-mono text-[10px]">
                {b.id.slice(0, 8)}…
              </span>,
              b.user.email,
              b.hotel.name,
              b.room.name,
              `${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}`,
              `$${String(b.totalPrice)}`,
              <Badge key={`${b.id}-s`} variant="secondary">
                {b.status}
              </Badge>,
              b.status === 'CONFIRMED' ? (
                <Button
                  key={`${b.id}-rf`}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={refundMut.isPending}
                  onClick={() => refundMut.mutate(b.id)}
                >
                  Refund
                </Button>
              ) : (
                <span key={`${b.id}-na`} className="text-xs text-muted-foreground">
                  —
                </span>
              ),
            ])}
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
