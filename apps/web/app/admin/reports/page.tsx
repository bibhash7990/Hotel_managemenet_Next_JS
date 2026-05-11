'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAccessToken } from '@/lib/auth-storage';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { downloadAdminReport } from '@/lib/admin-download';
import { toast } from 'sonner';
import { useStaffBasePath } from '@/lib/staff-base-path-context';

export default function AdminReportsPage() {
  const router = useRouter();
  const staffBase = useStaffBasePath();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null);

  useEffect(() => {
    if (!getAccessToken())
      router.replace(`/login?next=${encodeURIComponent(`${staffBase}/reports`)}`);
  }, [router, staffBase]);

  const run = async (format: 'csv' | 'pdf') => {
    const t = getAccessToken();
    if (!t) return;
    setBusy(format);
    try {
      await downloadAdminReport(format, t);
      toast.success('Download started');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setBusy(null);
    }
  };

  if (!token) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <PageHeader title="Reports" description="Export booking data as CSV or a simple PDF summary." />
      <Link href={staffBase} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-4 inline-flex')}>
        Back
      </Link>
      <div className="mt-8 flex flex-col gap-3">
        <Button type="button" disabled={busy !== null} onClick={() => void run('csv')}>
          {busy === 'csv' ? 'Preparing…' : 'Download CSV'}
        </Button>
        <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void run('pdf')}>
          {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
}
