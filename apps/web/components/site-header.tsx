'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Hotel, Menu, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAccessToken } from '@/lib/auth-storage';
import { getSessionRole, isHotelManagerRole, isSuperAdminRole } from '@/lib/session-role';
import { logoutClient } from '@/lib/auth-logout';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/notification-bell';

type NavLink = { label: string; href: string; icon?: React.ComponentType<{ className?: string }> };

export function SiteHeader() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setToken(getAccessToken());
    setRole(getSessionRole());
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const primaryLinks: NavLink[] = [{ label: 'Hotels', href: '/hotels', icon: Hotel }];
  // Bookings, wishlist, and profile live in the dashboard sub-nav; keep the top bar light.
  const accountLinks: NavLink[] = token
    ? [
        ...(isSuperAdminRole(role) ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
        ...(isHotelManagerRole(role) ? [{ label: 'Manager', href: '/manager', icon: Building2 }] : []),
      ]
    : [];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    cn(
      'interactive inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium',
      isActive(href)
        ? 'bg-primary text-primary-foreground shadow-soft'
        : 'text-foreground/80 hover:bg-secondary hover:text-foreground dark:text-slate-200 dark:hover:bg-slate-800'
    );

  const allLinks = [...primaryLinks, ...accountLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link
          href="/"
          className="interactive inline-flex items-center gap-2 rounded-full text-foreground"
          aria-label="StayHub home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-700 to-primary-500 text-primary-foreground shadow-soft">
            <Hotel className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">StayHub</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {allLinks.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <div className="hidden items-center gap-2 lg:flex">
              <NotificationBell />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logoutClient();
                  setToken(null);
                  setRole(null);
                  if (pathname.startsWith('/admin') || pathname.startsWith('/manager'))
                    window.location.href = '/';
                  else window.location.reload();
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center md:gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="interactive inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-secondary lg:hidden dark:hover:bg-slate-800"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="origin-top animate-slide-up border-t border-border/60 bg-background px-4 pb-6 pt-3 shadow-elevated lg:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {allLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'interactive flex h-12 items-center gap-3 rounded-xl px-3 text-base font-medium',
                  isActive(href)
                    ? 'bg-primary-50 text-primary dark:bg-slate-800 dark:text-slate-50'
                    : 'text-foreground/85 hover:bg-secondary dark:text-slate-200 dark:hover:bg-slate-800'
                )}
              >
                {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                {label}
              </Link>
            ))}
          </nav>
          {token ? (
            <div className="mt-3 flex flex-col items-end gap-2">
              <NotificationBell />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  await logoutClient();
                  setToken(null);
                  setRole(null);
                  if (pathname.startsWith('/admin') || pathname.startsWith('/manager'))
                    window.location.href = '/';
                  else window.location.reload();
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/login" className="contents">
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="contents">
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
