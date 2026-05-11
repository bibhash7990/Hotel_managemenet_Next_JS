import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Privacy policy',
  description: 'How StayHub handles personal information in this demo application.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="High-level summary for the StayHub demo. Replace with counsel-reviewed text before production."
      />
      <div className="mt-10 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-foreground">
          Demo placeholder — not a binding legal document.
        </p>
        <p>
          We collect account details (name, email) and booking data needed to operate reservations.
          Payments are processed by Stripe; we do not store full card numbers on StayHub servers.
        </p>
        <p>
          Marketing pages may use standard server logs. You can request account deletion by
          contacting support in a production deployment.
        </p>
      </div>
    </div>
  );
}
