import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, MailWarning, ShieldX } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Verify email',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string | string[] };
}) {
  const raw = searchParams.token;
  const token = typeof raw === 'string' ? raw : undefined;

  if (!token) {
    return (
      <AuthShell
        side="recover"
        eyebrow="Email verification"
        title="This link is invalid."
        subtitle="It’s missing a verification token — open the most recent message in your inbox and try again."
      >
        <div className="rounded-2xl border border-accent/40 bg-accent/8 p-5 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-accent-700">
              <MailWarning className="h-4 w-4" aria-hidden />
            </span>
            <p>Try copying the URL straight from your email — sometimes line breaks split it.</p>
          </div>
        </div>
        <Link href="/login" className="mt-6 block">
          <Button size="lg" className="w-full">
            Go to log in
          </Button>
        </Link>
      </AuthShell>
    );
  }

  const res = await fetch(`${API_BASE}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };

  if (!res.ok) {
    return (
      <AuthShell
        side="recover"
        eyebrow="Email verification"
        title="Verification failed."
        subtitle="This link may have expired or already been used."
      >
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/15">
              <ShieldX className="h-4 w-4" aria-hidden />
            </span>
            <p role="alert">
              {body.error ?? 'This link may have expired. Please register again or contact support.'}
            </p>
          </div>
        </div>
        <Link href="/login" className="mt-6 block">
          <Button size="lg" className="w-full">
            Go to log in
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      side="login"
      eyebrow="Email verified"
      title="You’re all set."
      subtitle="Your email is confirmed — sign in to start booking your next trip."
    >
      <div className="rounded-2xl border border-success/30 bg-success/8 p-5 text-sm text-success">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/20">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          </span>
          <p>{body.message ?? 'Your email has been confirmed.'}</p>
        </div>
      </div>
      <Link href="/login" className="mt-6 block">
        <Button size="lg" className="w-full">
          Continue to log in
        </Button>
      </Link>
    </AuthShell>
  );
}
