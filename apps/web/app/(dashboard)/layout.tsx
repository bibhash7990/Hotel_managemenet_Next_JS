'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarCheck, Heart, ShoppingBag, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', label: 'Bookings', icon: CalendarCheck },
  { href: '/book', label: 'Complete booking', icon: ShoppingBag },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === pathname || (pathname && pathname.startsWith(`${href}/`));

  return (
    <div className="bg-subtle-warm pb-12 dark:bg-slate-950">
      <nav
        aria-label="Account"
        className="sticky top-16 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-3 lg:px-8">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'interactive inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium',
                  active
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-foreground/75 hover:bg-secondary hover:text-foreground dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
