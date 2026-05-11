import { PageHeader } from '@/components/page-header';

export const metadata = {
  title: 'Cookie policy',
  description: 'How StayHub uses cookies and similar technologies in this demo.',
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        title="Cookie policy"
        description="Transparency about cookies in the StayHub demo."
      />
      <div className="mt-10 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-foreground">
          Demo placeholder — not a binding legal document.
        </p>
        <p>
          This site may set cookies for authentication sessions, security (for example CSRF-related
          flows where applicable), and preferences such as theme. Third-party payment scripts loaded
          during checkout may set their own cookies according to their policies.
        </p>
        <p>
          You can control cookies through your browser settings. Blocking required cookies may
          prevent sign-in.
        </p>
      </div>
    </div>
  );
}
