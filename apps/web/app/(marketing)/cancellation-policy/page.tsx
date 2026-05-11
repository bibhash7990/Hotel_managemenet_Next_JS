import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Cancellation policy',
  description: 'How cancellations and refunds work on StayHub.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Policies"
        title="Cancellation policy"
        description="Platform rules for changing or ending a reservation. Individual hotels may add stricter terms at checkout — always review the rate details before you pay."
      />

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p className="rounded-md border border-amber-200/80 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          This page is informational for the demo product. It is not legal advice.
        </p>
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">Where to cancel</h2>
          <p className="mt-2">
            Signed-in guests can open{' '}
            <Link
              href="/dashboard"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Your bookings
            </Link>
            , select a stay, and use the cancel or modify actions when the booking status allows it.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">Payment status</h2>
          <p className="mt-2">
            If a booking was paid through Stripe, refunds depend on whether the charge has settled
            and on the hotel’s rules. Pending or failed payments may disappear without a refund
            because no successful charge occurred.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">Need help?</h2>
          <p className="mt-2">
            <Link
              href="/contact"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Contact us
            </Link>{' '}
            with your booking reference and we’ll do our best to assist.
          </p>
        </section>
      </div>
    </div>
  );
}
