'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { forgotPasswordSchema } from '@hotel/shared';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiJson } from '@/lib/api';
import { toast } from 'sonner';

type Form = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<Form>({ resolver: zodResolver(forgotPasswordSchema), mode: 'onBlur' });

  async function onSubmit(values: Form) {
    try {
      await apiJson<{ message: string }>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('If an account exists, we sent reset instructions.');
    } catch {
      toast.error('Could not send reset email');
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthShell
      side="recover"
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="No problem. Enter your email and we'll send a link to set a new one."
      footer={
        <p className="text-center text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Email
          </Label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...form.register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  );
}
