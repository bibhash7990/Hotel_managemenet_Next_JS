'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/query-state';
import { toast } from 'sonner';

type Item = {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt?: string;
};

const fmtAgo = (iso?: string) => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export default function NotificationsPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login?next=/notifications');
  }, [router]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['notifications', token],
    enabled: !!token,
    queryFn: () => apiJson<{ items: Item[] }>('/api/v1/notifications', { accessToken: token! }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiJson(`/api/v1/notifications/${id}/read`, { method: 'PATCH', accessToken: token! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  const markAll = useMutation({
    mutationFn: () =>
      apiJson('/api/v1/notifications/mark-all-read', { method: 'POST', accessToken: token! }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!token) return null;

  const unread = data?.items.filter((n) => !n.read).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Updates about your bookings, payments, and account activity."
        actions={
          unread > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <Check className="h-4 w-4" aria-hidden /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="mt-8">
        {isPending && (
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-2xl border border-border p-5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </li>
            ))}
          </ul>
        )}
        {isError && (
          <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
        )}
        {data && data.items.length === 0 && (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="When something happens with a booking or your account, it'll show up here."
          />
        )}
        {data && data.items.length > 0 && (
          <ul className="space-y-3">
            {data.items.map((n) => (
              <li
                key={n._id}
                className={cn(
                  'group flex flex-col gap-3 rounded-2xl border p-5 shadow-soft transition-all sm:flex-row sm:items-center',
                  n.read
                    ? 'border-border bg-card dark:border-slate-800 dark:bg-slate-900'
                    : 'border-primary/30 bg-primary/5'
                )}
              >
                <span
                  className={cn(
                    'mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                    n.read
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}
                  aria-hidden
                >
                  <Bell className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold leading-tight">{n.title}</p>
                    {!n.read ? (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                  {n.createdAt ? (
                    <p className="mt-1 text-xs text-muted-foreground/70">{fmtAgo(n.createdAt)}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => markRead.mutate(n._id)}
                    >
                      Mark read
                    </Button>
                  )}
                  {n.link ? (
                    <Link
                      href={n.link}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
