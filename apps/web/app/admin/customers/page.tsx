'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { AdminDataTable } from '@/components/admin/data-table';
import { ErrorState } from '@/components/query-state';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStaffBasePath } from '@/lib/staff-base-path-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserRow = { id: string; email: string; name: string; role: string; emailVerified: boolean };

export default function AdminCustomersPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/customers`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-customers', token, page, q],
    enabled: !!token,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (q.trim()) params.set('q', q.trim());
      return apiJson<{ items: UserRow[]; totalPages: number }>(`/api/v1/admin/customers?${params}`, {
        accessToken: token!,
      });
    },
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status === 403) return false;
      return failureCount < 2;
    },
  });

  if (!token) return null;

  const forbidden = isError && error instanceof ApiError && error.status === 403;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader title="Customers" description="Super-admin directory of registered users." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      <form
        className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          void refetch();
        }}
      >
        <div className="flex-1">
          <Label htmlFor="cq">Search</Label>
          <Input id="cq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email or name" className="mt-1.5" />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {forbidden && (
        <p className="mt-6 text-sm text-destructive">You need Super Admin access to view customers.</p>
      )}
      {isError && !forbidden && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && (
        <>
          <AdminDataTable
            className="mt-6"
            columns={['Name', 'Email', 'Role', 'Verified']}
            rows={data.items.map((u) => [u.name, u.email, u.role, u.emailVerified ? 'Yes' : 'No'])}
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
