'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CalendarDays, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState, HotelDetailSkeleton } from '@/components/query-state';
import { toast } from 'sonner';

const schema = z.object({
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.coerce.number().min(1).max(20),
});

type Form = z.infer<typeof schema>;

export default function ModifyBookingPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!getAccessToken()) router.replace(`/login?next=/dashboard/bookings/${id}/modify`);
  }, [router, id]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['booking', id, token],
    enabled: !!token && !!id,
    queryFn: () =>
      apiJson<{
        checkIn: string;
        checkOut: string;
        guests: number;
        status: string;
      }>(`/api/v1/bookings/${id}`, { accessToken: token! }),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        checkIn: data.checkIn.slice(0, 10),
        checkOut: data.checkOut.slice(0, 10),
        guests: data.guests,
      });
    }
  }, [data, form]);

  const mut = useMutation({
    mutationFn: async (v: Form) => {
      const checkIn = new Date(v.checkIn).toISOString();
      const checkOut = new Date(v.checkOut).toISOString();
      return apiJson(`/api/v1/bookings/${id}`, {
        method: 'PATCH',
        accessToken: token!,
        body: JSON.stringify({ action: 'modify', checkIn, checkOut, guests: v.guests }),
      });
    },
    onSuccess: () => {
      toast.success('Booking updated');
      void qc.invalidateQueries({ queryKey: ['booking', id] });
      void qc.invalidateQueries({ queryKey: ['my-bookings'] });
      router.push(`/dashboard/bookings/${id}`);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Update failed'),
  });

  if (!token) return null;
  if (isPending) return <HotelDetailSkeleton />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorState message={(error as Error)?.message ?? 'Error'} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (data.status !== 'PENDING' && data.status !== 'CONFIRMED') {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-serif text-2xl">This booking cannot be modified.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Modifications are only available for pending or confirmed reservations.
            </p>
            <Link
              href={`/dashboard/bookings/${id}`}
              className={cn(buttonVariants({ variant: 'default' }), 'mt-6 inline-flex')}
            >
              Back to booking
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 lg:px-8">
      <Link
        href={`/dashboard/bookings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to booking
      </Link>

      <PageHeader
        className="mt-6"
        eyebrow="Modify booking"
        title="Change your stay"
        description="Update dates or guest count — availability is re-checked automatically."
      />

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form className="space-y-5" onSubmit={form.handleSubmit((v) => mut.mutate(v))} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="checkIn">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Check-in
                </Label>
                <Input id="checkIn" type="date" {...form.register('checkIn')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkOut">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Check-out
                </Label>
                <Input id="checkOut" type="date" {...form.register('checkOut')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guests">
                <Users className="h-3.5 w-3.5" aria-hidden /> Guests
              </Label>
              <Input id="guests" type="number" min={1} max={20} {...form.register('guests')} />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={mut.isPending}>
                {mut.isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Link
                href={`/dashboard/bookings/${id}`}
                className={cn(buttonVariants({ variant: 'ghost' }), 'inline-flex')}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
