import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'StayHub — Hotel Booking',
    template: '%s · StayHub',
  },
  description: 'Browse hotels, compare rooms, and book your next stay with confidence.',
  applicationName: 'StayHub',
  appleWebApp: {
    capable: true,
    title: 'StayHub',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'StayHub — Hotel Booking',
    description: 'Modern hotel booking with transparent pricing and instant confirmation.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const footerSections = [
  {
    title: 'Discover',
    links: [
      { label: 'Browse hotels', href: '/hotels' },
      { label: 'Popular destinations', href: '/destinations' },
      { label: 'Last-minute deals', href: '/deals' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'Your bookings', href: '/dashboard' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Cancellation policy', href: '/cancellation-policy' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer
              role="contentinfo"
              className="mt-16 border-t border-border bg-primary-900 text-slate-200 dark:border-slate-800"
            >
              <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div>
                  <p className="font-serif text-2xl font-semibold tracking-tight text-white">
                    StayHub
                  </p>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
                    Real availability, transparent pricing, and instant confirmation — for every
                    kind of stay.
                  </p>
                </div>
                {footerSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-sm font-semibold uppercase tracking-wider text-accent-300">
                      {section.title}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-slate-300 transition-colors hover:text-white"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row lg:px-8">
                  <p>© {new Date().getFullYear()} StayHub. Stay well, travel often.</p>
                  <p className="flex gap-4">
                    <Link href="/privacy" className="hover:text-white">
                      Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-white">
                      Terms
                    </Link>
                    <Link href="/cookies" className="hover:text-white">
                      Cookies
                    </Link>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
