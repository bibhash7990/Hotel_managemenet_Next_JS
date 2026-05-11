'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@hotel/shared';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { apiJson } from '@/lib/api';
import { toast } from 'sonner';

type Form = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordFormInner({ token }: { token: string }) {
  const router = useRouter();
  const form = useForm<Form>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  });

  async function onSubmit(values: Form) {
    try {
      await apiJson<{ message: string }>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Password updated');
      router.push('/login');
    } catch {
      toast.error('Invalid or expired link');
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthShell
      side="recover"
      eyebrow="Reset password"
      title="Set a new password."
      subtitle="Choose something strong — at least 8 characters with a mix of letters and numbers."
      footer={
        <p className="text-center text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...form.register('token')} />
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  if (!token) {
    return (
      <AuthShell
        side="recover"
        eyebrow="Reset password"
        title="This link looks invalid."
        subtitle="Open the most recent reset link from your email — or request a fresh one below."
        footer={
          <p className="text-center text-muted-foreground">
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to log in
            </Link>
          </p>
        }
      >
        <Link href="/forgot-password" className="block">
          <Button size="lg" className="w-full">
            Request a new link
          </Button>
        </Link>
      </AuthShell>
    );
  }

  return <ResetPasswordFormInner key={token} token={token} />;
}
