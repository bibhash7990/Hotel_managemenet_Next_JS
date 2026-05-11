import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 min-h-11 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-foreground shadow-soft transition-shadow placeholder:text-muted-foreground/80 hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 file:border-0 file:bg-transparent file:text-sm file:font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
