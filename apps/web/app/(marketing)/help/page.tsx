import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Help center',
  description: 'Answers to common questions about booking, payments, and your StayHub account.',
};

const faqs = [
  {
    q: 'How do I confirm a booking?',
    a: 'Pick dates and a room on a hotel page, complete guest details, and pay with Stripe Checkout. Confirmed stays appear under Your bookings in the dashboard.',
  },
  {
    q: 'Can I change or cancel a reservation?',
    a: 'Open the booking from your dashboard and use the options there. Refund timing depends on the hotel policy and payment state — see our cancellation policy for the platform rules.',
  },
  {
    q: 'Why do I need to verify my email?',
    a: 'Verification protects your account and lets us send booking confirmations and important trip updates.',
  },
  {
    q: 'Who do I contact for billing issues?',
    a: 'Use the contact form and choose a clear subject line — our team routes billing questions to the right queue.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Support"
        title="Help center"
        description="Quick answers about searching, booking, and managing your trips on StayHub."
      />

      <div className="mt-10 space-y-8">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Common questions</h2>
          <ul className="mt-6 space-y-6">
            {faqs.map((item) => (
              <li key={item.q}>
                <p className="font-medium text-foreground">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted-foreground">
          Still stuck?{' '}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contact us
          </Link>{' '}
          or read the{' '}
          <Link
            href="/cancellation-policy"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            cancellation policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
