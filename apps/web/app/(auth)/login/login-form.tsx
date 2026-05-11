'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { apiJson } from '@/lib/api';
import { setAccessToken } from '@/lib/auth-storage';
import { syncAccessCookie } from '@/lib/sync-access-cookie';
import { isHotelManagerRole, isSuperAdminRole, setSessionRole } from '@/lib/session-role';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type Form = z.infer<typeof schema>;

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur' });

  async function onSubmit(values: Form) {
    try {
      const res = await apiJson<{
        accessToken: string;
        user: { id: string; email: string; name: string; role: string; emailVerified: boolean };
      }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setAccessToken(res.accessToken);
      setSessionRole(res.user.role);
      try {
        await syncAccessCookie(res.accessToken);
      } catch {
        /* cookie mirror optional if JWT_ACCESS_SECRET missing on web */
      }
      const isDefaultDestination = nextPath === '/dashboard' || nextPath === '/';
      const destination =
        isDefaultDestination && isSuperAdminRole(res.user.role)
          ? '/admin'
          : isDefaultDestination && isHotelManagerRole(res.user.role)
            ? '/manager'
            : nextPath;
      toast.success('Welcome back');
      router.push(destination);
      router.refresh();
    } catch {
      toast.error('Invalid email or password');
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthShell
      side="login"
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick up where you left off — your saved hotels and upcoming bookings are right here."
      footer={
        <p className="text-center text-muted-foreground">
          Don’t have an account?{' '}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Email
          </Label>
          <Input
            id="email"
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
    </AuthShell>
  );
}
