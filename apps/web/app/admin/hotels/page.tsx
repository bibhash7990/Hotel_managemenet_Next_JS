'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { AdminDataTable } from '@/components/admin/data-table';
import { ErrorState } from '@/components/query-state';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

type Hotel = { id: string; name: string; slug: string; city: string; country: string; status: string };

export default function AdminHotelsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/hotels`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-hotels', token],
    enabled: !!token,
    queryFn: () => apiJson<{ items: Hotel[] }>('/api/v1/admin/hotels', { accessToken: token! }),
  });

  if (!token) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Hotels" description="Properties you can manage via the API (full CRUD)." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back to overview
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {isError && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && (
        <AdminDataTable
          className="mt-6"
          columns={['Name', 'Slug', 'City', 'Status']}
          rows={data.items.map((h) => [
            h.name,
            <span key={h.id} className="font-mono text-xs">
              {h.slug}
            </span>,
            `${h.city}, ${h.country}`,
            h.status,
          ])}
        />
      )}
    </div>
  );
}
