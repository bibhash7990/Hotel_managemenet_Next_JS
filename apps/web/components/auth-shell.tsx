import Image from 'next/image';
import Link from 'next/link';
import { Hotel, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'login' | 'register' | 'recover';
};

const sideBySide: Record<string, { tag: string; quote: string; img: string }> = {
  login: {
    tag: 'Welcome back',
    quote: 'Your saved hotels and trips are right where you left them.',
    img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=70',
  },
  register: {
    tag: 'Join StayHub',
    quote: 'Curated stays, transparent pricing, and instant confirmation.',
    img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=70',
  },
  recover: {
    tag: 'We’ve got you',
    quote: 'A reset link is one click away — your trips will be waiting.',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=70',
  },
};

export function AuthShell({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
  side = 'login',
}: AuthShellProps) {
  const panel = sideBySide[side];
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-foreground lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary-700 to-primary-500 text-primary-foreground shadow-soft">
              <Hotel className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">StayHub</span>
          </Link>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image src={panel.img} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-700/65 to-primary-500/45" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-md">
              <Hotel className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-serif text-2xl font-semibold tracking-tight">StayHub</span>
          </Link>
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent-200" aria-hidden />
              {panel.tag}
            </span>
            <p className="mt-6 font-serif text-3xl leading-tight text-white">
              “{panel.quote}”
            </p>
            <div className="mt-8 grid gap-3 text-sm text-white/85">
              <p>· Real availability — no surprise sell-outs</p>
              <p>· Instant booking confirmation by email</p>
              <p>· Stripe-powered checkout, never re-enter cards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
