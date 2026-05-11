import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { ContactForm } from './contact-form';

export const metadata = {
  title: 'Contact us',
  description: 'Reach the StayHub team — we read every message.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Support"
        title="Contact us"
        description="Questions about a booking, your account, or partnerships? Send a note and we’ll route it to the right person."
      />
      <p className="mt-4 text-sm text-muted-foreground">
        For quick answers, see the{' '}
        <Link href="/help" className="font-medium text-primary underline-offset-4 hover:underline">
          help center
        </Link>
        .
      </p>
      <ContactForm />
    </div>
  );
}
