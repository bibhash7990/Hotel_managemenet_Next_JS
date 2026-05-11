'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState } from '@/components/query-state';
import { toast } from 'sonner';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

type Item = { key: string; value: string };

export default function AdminSettingsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/settings`)}`);
  }, [router, staffBase]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['admin-settings', token],
    enabled: !!token,
    queryFn: () => apiJson<{ items: Item[] }>('/api/v1/admin/settings', { accessToken: token! }),
    retry: (c, err) => !(err instanceof ApiError && err.status === 403) && c < 2,
  });

  useEffect(() => {
    if (data?.items) {
      const d: Record<string, string> = {};
      for (const it of data.items) d[it.key] = it.value;
      setDraft(d);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      apiJson('/api/v1/admin/settings', {
        method: 'PUT',
        accessToken: token!,
        body: JSON.stringify({
          settings: Object.entries(draft).map(([key, value]) => ({ key, value })),
        }),
      }),
    onSuccess: () => {
      toast.success('Settings saved');
      void qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Save failed'),
  });

  if (!token) return null;

  const forbidden = isError && error instanceof ApiError && error.status === 403;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader title="Site settings" description="Key/value configuration (super-admin)." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      {isPending && <p className="mt-6 text-muted-foreground">Loading…</p>}
      {forbidden && <p className="mt-6 text-sm text-destructive">Super Admin only.</p>}
      {isError && !forbidden && <ErrorState className="mt-6" message={(error as Error).message} onRetry={() => void refetch()} />}
      {data && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Add keys like <code className="rounded bg-muted px-1">support_email</code> or{' '}
            <code className="rounded bg-muted px-1">banner_message</code>.
          </p>
          {['support_email', 'banner_message', 'maintenance_mode'].map((key) => (
            <div key={key}>
              <Label htmlFor={key}>{key}</Label>
              <Input
                id={key}
                className="mt-1.5"
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      )}
    </div>
  );
}
