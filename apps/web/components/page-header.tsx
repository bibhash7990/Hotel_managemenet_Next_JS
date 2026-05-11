import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
    >
      <div className="animate-slide-up">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        ) : null}
        <h1 className={cn('font-serif text-heading-1', eyebrow && 'mt-2')}>{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-body text-muted-foreground dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
