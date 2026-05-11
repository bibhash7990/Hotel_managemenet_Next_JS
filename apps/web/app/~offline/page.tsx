import Link from 'next/link';

export const metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <p className="font-serif text-3xl font-semibold text-primary-900 dark:text-slate-100">
        You are offline
      </p>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        StayHub needs a network connection for live availability and bookings. Check your
        connection, then try again.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-primary-950 shadow-sm transition hover:bg-accent-400"
      >
        Back to home
      </Link>
    </div>
  );
}
