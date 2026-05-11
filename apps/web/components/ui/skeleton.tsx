import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'skeleton-shimmer animate-pulse-soft rounded-md bg-muted/80 dark:bg-slate-800/80',
        className
      )}
      {...props}
    />
  );
}
