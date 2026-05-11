'use client';

import Link from 'next/link';
import { StaffBasePathProvider } from '@/lib/staff-base-path-context';
import { cn } from '@/lib/utils';

export type StaffNavLink = { href: string; label: string };

export function StaffShell({
  basePath,
  eyebrow,
  navAriaLabel,
  links,
  children,
}: {
  basePath: '/admin' | '/manager';
  eyebrow: string;
  navAriaLabel: string;
  links: readonly StaffNavLink[];
  children: React.ReactNode;
}) {
  return (
    <StaffBasePathProvider value={basePath}>
      <div className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted-foreground">{eyebrow}</p>
            <Link
              href="/"
              className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Exit to site
            </Link>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2 text-sm" aria-label={navAriaLabel}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-md px-3 py-2 font-medium text-muted-foreground hover:bg-white hover:text-foreground dark:hover:bg-slate-800',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </StaffBasePathProvider>
  );
}
