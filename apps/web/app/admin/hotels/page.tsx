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

  const isManagerPanel = staffBase === '/manager';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title={isManagerPanel ? 'Your properties' : 'Hotels'}
        description={
          isManagerPanel
            ? 'Only hotels you operate (your account as owner). Add rooms and handle bookings per property.'
            : 'All hotels on the platform. Create, edit, or remove properties and assign ownership.'
        }
      />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back to overview
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {isError && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-muted-foreground dark:border-slate-600">
          {isManagerPanel
            ? 'You have no hotels yet. A super admin can transfer ownership, or create a hotel via the API as your account (new hotels are always owned by the signed-in manager).'
            : 'No hotels in the database.'}
        </p>
      )}
      {data && data.items.length > 0 && (
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
