'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(1).max(5000),
});

type Form = z.infer<typeof schema>;

function WriteReviewForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const [ready, setReady] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, bookingId: sp.get('bookingId') ?? '' },
  });

  useEffect(() => {
    const id = sp.get('bookingId');
    if (id) form.setValue('bookingId', id);
    setReady(true);
  }, [sp, form]);

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login?next=/dashboard/reviews/write');
  }, [router]);

  const mut = useMutation({
    mutationFn: (body: Form) =>
      apiJson('/api/v1/reviews', {
        method: 'POST',
        accessToken: token!,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Review submitted — it will appear after moderation.');
      router.push('/dashboard');
    },
    onError: (e) => {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error((e as Error).message);
    },
  });

  if (!token || !ready) return null;

  const bid = form.watch('bookingId');
  if (!bid) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <PageHeader title="Write a review" description="Choose a completed stay from your dashboard." />
        <p className="mt-4 text-sm text-muted-foreground">
          Missing <code className="text-xs">bookingId</code> in the URL. Open this page from a completed booking.
        </p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'secondary' }), 'mt-6 inline-flex')}>
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <PageHeader title="Write a review" description="Share feedback for a completed stay. Reviews are moderated before publishing." />
      <form
        className="mt-8 space-y-5"
        onSubmit={form.handleSubmit((v) => mut.mutate(v))}
        noValidate
      >
        <input type="hidden" {...form.register('bookingId')} />
        <div className="space-y-1.5">
          <Label htmlFor="rating">Rating (1–5)</Label>
          <Input id="rating" type="number" min={1} max={5} {...form.register('rating')} />
          {form.formState.errors.rating && (
            <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register('title')} />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comment">Comment</Label>
          <textarea
            id="comment"
            rows={5}
            className={cn(
              'flex min-h-[120px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-soft focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'
            )}
            {...form.register('comment')}
          />
          {form.formState.errors.comment && (
            <p className="text-xs text-destructive">{form.formState.errors.comment.message}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), 'inline-flex')}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted-foreground">Loading…</p>}>
      <WriteReviewForm />
    </Suspense>
  );
}
