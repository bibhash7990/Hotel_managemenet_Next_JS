import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Terms of service',
  description: 'Terms governing use of the StayHub demo application.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        description="Demo terms outline. Replace with a full agreement before inviting real customers."
      />
      <div className="mt-10 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-foreground">
          Demo placeholder — not a binding legal document.
        </p>
        <p>
          By using this application you agree to follow applicable laws, provide accurate
          information, and accept that hotel inventory and pricing come from participating
          properties and may change until a booking is confirmed.
        </p>
        <p>
          The service is provided as-is for evaluation. Limitation of liability, dispute resolution,
          and governing law sections would be expanded in a production version.
        </p>
      </div>
    </div>
  );
}
