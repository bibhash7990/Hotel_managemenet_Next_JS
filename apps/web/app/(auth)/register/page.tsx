'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User } from 'lucide-react';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { apiJson } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type Form = z.infer<typeof schema>;

function strengthFor(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];
const colors = ['bg-destructive', 'bg-destructive', 'bg-accent', 'bg-success', 'bg-success'];

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<Form>({ resolver: zodResolver(schema), mode: 'onBlur' });

  async function onSubmit(values: Form) {
    try {
      await apiJson('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Account created — check your email to verify.');
      router.push('/login');
    } catch {
      toast.error('Could not register');
    }
  }

  const errors = form.formState.errors;
  const password = form.watch('password') ?? '';
  const score = strengthFor(password);

  return (
    <AuthShell
      side="register"
      eyebrow="Create account"
      title="Start travelling smarter."
      subtitle="Join in seconds — save your favourite hotels and book in fewer clicks."
      footer={
        <p className="text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">
            <User className="h-3.5 w-3.5" aria-hidden />
            Full name
          </Label>
          <Input
            id="name"
            placeholder="Avani Patel"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...form.register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
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
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={
                    'h-1.5 flex-1 rounded-full transition-colors ' +
                    (score > i ? colors[score] : 'bg-border dark:bg-slate-700')
                  }
                />
              ))}
            </div>
            <span className="w-16 text-right text-xs font-medium text-muted-foreground">
              {password ? labels[score] : 'Strength'}
            </span>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-xs text-muted-foreground">
          By continuing you agree to StayHub’s{' '}
          <Link href="#" className="font-medium underline-offset-2 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="#" className="font-medium underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
