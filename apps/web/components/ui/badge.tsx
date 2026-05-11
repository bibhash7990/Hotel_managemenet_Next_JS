import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/10 text-destructive ring-1 ring-destructive/30',
        outline:
          'border-border text-foreground dark:border-slate-700 dark:text-slate-100',
        success:
          'border-transparent bg-success/12 text-success ring-1 ring-success/30 dark:bg-success/20',
        warning:
          'border-transparent bg-accent/15 text-accent-700 ring-1 ring-accent/40 dark:bg-accent/25 dark:text-accent-200',
        info: 'border-transparent bg-info/12 text-info ring-1 ring-info/30',
        muted:
          'border-transparent bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
