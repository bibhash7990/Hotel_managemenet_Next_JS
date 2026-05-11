import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Compass,
  CreditCard,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { SearchHero } from '@/components/search-hero';
import { Button } from '@/components/ui/button';

const origin = (process.env.NEXT_PUBLIC_WEB_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'StayHub',
  description: 'Hotel search and booking with secure Stripe Checkout.',
  url: origin || undefined,
};

const destinations = [
  {
    name: 'Paris',
    country: 'France',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=70',
    blurb: '320+ stays',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=70',
    blurb: '210+ stays',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=70',
    blurb: '145+ stays',
  },
  {
    name: 'New York',
    country: 'USA',
    img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=70',
    blurb: '480+ stays',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=70',
    blurb: '290+ stays',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=70',
    blurb: '180+ stays',
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Real availability',
    body: 'Inventory is locked the moment you start checkout — no double-bookings, ever.',
  },
  {
    icon: CreditCard,
    title: 'Transparent pricing',
    body: 'Nightly rates plus taxes shown up front. The price you see is the price you pay.',
  },
  {
    icon: Sparkles,
    title: 'Stays you’ll love',
    body: 'Hand-picked properties from boutique guesthouses to five-star resorts.',
  },
  {
    icon: Award,
    title: 'Built for scale',
    body: 'Reliable architecture and instant confirmation, whether it’s one room or fifty.',
  },
];

const testimonials = [
  {
    name: 'Maya R.',
    location: 'Lisbon',
    stars: 5,
    body: 'The clearest pricing I’ve seen on a booking site — and the rooftop room in Florence was a dream.',
  },
  {
    name: 'Devon K.',
    location: 'Brooklyn',
    stars: 5,
    body: 'Booked, paid, and at the front desk in under three minutes. Confirmation was instant.',
  },
  {
    name: 'Hana S.',
    location: 'Kyoto',
    stars: 5,
    body: 'Saved a list of ryokans, then found a midweek deal a week later. Easy to come back to.',
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <section className="relative isolate flex min-h-[640px] items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/0 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 lg:px-8">
          <div className="max-w-3xl text-white animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent-200" aria-hidden />
              Curated stays · Instant confirmation
            </span>
            <h1 className="mt-6 font-serif text-balance text-display leading-[1.05]">
              Find a stay that feels{' '}
              <em className="text-accent-300 not-italic">unforgettable</em>.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-white/85">
              Search thousands of rooms with real availability, transparent pricing, and a checkout
              that just works. Your next great trip starts here.
            </p>
          </div>

          <div className="relative mt-12 animate-slide-up">
            <SearchHero />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-300" aria-hidden /> Free cancellation
              on most rooms
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-300" aria-hidden /> No booking fees
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-300" aria-hidden /> Secure Stripe
              checkout
            </span>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-20 lg:px-8"
        aria-labelledby="destinations-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Compass className="h-3.5 w-3.5" aria-hidden /> Travel inspiration
            </p>
            <h2 id="destinations-heading" className="mt-2 font-serif text-heading-1">
              Popular destinations
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Loved by guests, ready when you are. Tap a city to see the latest stays and rates.
            </p>
          </div>
          <Link href="/hotels" className="hidden md:inline-flex">
            <Button variant="ghost">Browse all hotels →</Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link
              key={d.name}
              href={`/hotels?city=${encodeURIComponent(d.name)}`}
              className="group relative block overflow-hidden rounded-2xl shadow-soft transition-shadow hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/5] sm:aspect-[5/6]">
                <Image
                  src={d.img}
                  alt={`${d.name}, ${d.country}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-2xl tracking-tight">{d.name}</p>
                  <p className="mt-1 flex items-center justify-between text-sm text-white/80">
                    <span>{d.country}</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-md">
                      {d.blurb}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/hotels">
            <Button variant="outline">Browse all hotels →</Button>
          </Link>
        </div>
      </section>

      <section className="bg-subtle-warm py-20 dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 lg:px-8" aria-labelledby="why-stayhub">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why StayHub
            </p>
            <h2 id="why-stayhub" className="mt-2 font-serif text-heading-1">
              The booking experience travelers actually want.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built around honest pricing and fast confirmations — none of the noise, all of the
              trust.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-white p-6 shadow-soft transition-shadow hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary dark:bg-slate-800">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-20 lg:px-8"
        aria-labelledby="testimonials"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Loved by guests
          </p>
          <h2 id="testimonials" className="mt-2 font-serif text-heading-1">
            Stories from recent stays.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
            >
              <Quote
                className="absolute right-6 top-6 h-8 w-8 text-primary-100 dark:text-slate-800"
                aria-hidden
              />
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-foreground">
                “{t.body}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted-foreground"> · {t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-8 py-16 text-center text-white shadow-elevated sm:px-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-200">
            Ready when you are
          </p>
          <h2 className="mt-3 font-serif text-display leading-tight">Where to next?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Browse our curated collection or jump straight in — your saved hotels and bookings are
            always one tap away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/hotels">
              <Button variant="accent" size="lg">
                Browse hotels
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
