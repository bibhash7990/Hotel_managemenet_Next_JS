'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-destructive/40 dark:bg-destructive/10',
        className
      )}
    >
      <div className="flex items-start gap-3 text-destructive">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-destructive/85">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed bg-card/60', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary dark:bg-slate-800">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="font-serif text-2xl tracking-tight text-foreground">{title}</p>
          {description ? (
            <p className="mt-2 max-w-md text-sm text-muted-foreground dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function HotelsGridSkeleton() {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading hotels"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <CardContent className="space-y-2 pt-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-3 flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8" aria-busy="true" aria-label="Loading hotel">
      <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <Skeleton className="aspect-[16/10] w-full rounded-2xl sm:col-span-2 sm:row-span-2" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </div>
      <Skeleton className="mt-8 h-9 w-2/3 max-w-md" />
      <Skeleton className="mt-2 h-5 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-10 h-7 w-32" />
      <ul className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-2xl border border-border p-5 dark:border-slate-800"
          >
            <Skeleton className="h-20 w-28 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-11 w-24 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BookingsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Loading bookings">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-border p-5 dark:border-slate-800">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-28 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-7 w-20 self-start rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminKpiSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading admin metrics">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-10 w-20" />
          <Skeleton className="mt-2 h-3 w-16" />
        </Card>
      ))}
    </div>
  );
}
