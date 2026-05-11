'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ErrorState } from '@/components/query-state';
import { toast } from 'sonner';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

type Rev = {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  hotelId: string;
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/reviews`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-reviews', token],
    enabled: !!token,
    queryFn: () => apiJson<{ items: Rev[] }>('/api/v1/admin/reviews', { accessToken: token! }),
  });

  const mod = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      apiJson(`/api/v1/admin/reviews/${id}`, {
        method: 'PATCH',
        accessToken: token!,
        body: JSON.stringify({ moderationStatus: status }),
      }),
    onSuccess: () => {
      toast.success('Updated');
      void qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Review moderation" description="Pending reviews from guests." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {isError && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && <p className="mt-6 text-muted-foreground">Queue is empty.</p>}
      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((r) => (
            <li key={r._id} className="rounded-lg border p-4 dark:border-slate-800">
              <p className="font-medium">
                {'★'.repeat(r.rating)} {r.title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <div className="mt-3 flex gap-2">
                <Button type="button" className="h-9 min-h-0 px-3 text-xs" onClick={() => mod.mutate({ id: r._id, status: 'APPROVED' })}>
                  Approve
                </Button>
                <Button type="button" className="h-9 min-h-0 px-3 text-xs" variant="destructive" onClick={() => mod.mutate({ id: r._id, status: 'REJECTED' })}>
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
