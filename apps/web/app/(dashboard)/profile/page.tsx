'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { ErrorState } from '@/components/query-state';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().max(40).optional(),
  avatarUrl: z.union([z.literal(''), z.string().url()]).optional(),
});

const pwdSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirm: z.string().min(8).max(128),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  });

export default function ProfilePage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const qc = useQueryClient();

  useEffect(() => {
    if (!getAccessToken()) router.replace('/login?next=/profile');
  }, [router]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['me', token],
    enabled: !!token,
    queryFn: () =>
      apiJson<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        avatarUrl: string | null;
      }>('/api/v1/auth/me', { accessToken: token! }),
  });

  const pf = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const pw = useForm<z.infer<typeof pwdSchema>>({ resolver: zodResolver(pwdSchema) });

  useEffect(() => {
    if (data) {
      pf.reset({
        name: data.name,
        phone: data.phone ?? '',
        avatarUrl: data.avatarUrl ?? '',
      });
    }
  }, [data, pf]);

  const saveProfile = useMutation({
    mutationFn: (body: z.infer<typeof profileSchema>) =>
      apiJson('/api/v1/auth/me', {
        method: 'PATCH',
        accessToken: token!,
        body: JSON.stringify({
          name: body.name,
          phone: body.phone || null,
          avatarUrl: body.avatarUrl || null,
        }),
      }),
    onSuccess: () => {
      toast.success('Profile saved');
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Save failed'),
  });

  const savePwd = useMutation({
    mutationFn: (body: z.infer<typeof pwdSchema>) =>
      apiJson('/api/v1/auth/me/password', {
        method: 'PATCH',
        accessToken: token!,
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
        }),
      }),
    onSuccess: () => {
      toast.success('Password updated — please sign in again if needed');
      pw.reset();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Update failed'),
  });

  if (!token) return null;
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-10 lg:px-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      </div>
    );
  }

  const avatar = data.avatarUrl;
  const initial = (data.name || data.email).slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pt-10 lg:px-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Update your personal info, avatar, and password."
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-5 pt-8 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-primary-700 to-primary-400 text-white shadow-soft">
            {avatar ? (
              <Image src={avatar} alt={data.name} fill sizes="80px" className="object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center font-serif text-3xl font-semibold">
                {initial}
              </span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-serif text-2xl tracking-tight">{data.name || 'Welcome'}</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {data.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={pf.handleSubmit((v) => saveProfile.mutate(v))}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  <User className="h-3.5 w-3.5" aria-hidden /> Name
                </Label>
                <Input id="name" {...pf.register('name')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  <Phone className="h-3.5 w-3.5" aria-hidden /> Phone
                </Label>
                <Input id="phone" {...pf.register('phone')} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden /> Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                placeholder="https://…"
                {...pf.register('avatarUrl')}
              />
            </div>
            <Button type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={pw.handleSubmit((v) => savePwd.mutate(v))}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                {...pw.register('currentPassword')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <PasswordInput
                  id="newPassword"
                  autoComplete="new-password"
                  {...pw.register('newPassword')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <PasswordInput
                  id="confirm"
                  autoComplete="new-password"
                  {...pw.register('confirm')}
                />
                {pw.formState.errors.confirm ? (
                  <p className="text-xs text-destructive">
                    {pw.formState.errors.confirm.message as string}
                  </p>
                ) : null}
              </div>
            </div>
            <Button type="submit" disabled={savePwd.isPending}>
              {savePwd.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
