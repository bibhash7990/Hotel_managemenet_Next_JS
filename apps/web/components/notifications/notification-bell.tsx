'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { apiJson } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Notif = { _id: string; read: boolean; title: string };

export function NotificationBell() {
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', token],
    enabled: !!token,
    queryFn: () => apiJson<{ items: Notif[] }>('/api/v1/notifications', { accessToken: token! }),
  });

  const markAll = useMutation({
    mutationFn: () =>
      apiJson<{ ok: boolean }>('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        accessToken: token!,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!token) return null;

  const unread = data?.items?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/notifications"
        className={cn(
          'interactive relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-slate-200 dark:hover:bg-slate-800'
        )}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-background dark:ring-slate-950">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </Link>
      {unread > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden text-xs sm:inline-flex"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
        >
          Mark all read
        </Button>
      ) : null}
    </div>
  );
}
