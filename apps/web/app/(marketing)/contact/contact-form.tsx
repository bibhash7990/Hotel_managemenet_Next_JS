'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '@hotel/shared';
import type { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { apiJson, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Form = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const form = useForm<Form>({ resolver: zodResolver(contactFormSchema), mode: 'onBlur' });

  async function onSubmit(values: Form) {
    setServerMessage(null);
    try {
      const res = await apiJson<{ ok: boolean; delivered: boolean }>('/api/v1/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (res.delivered) {
        setServerMessage('Thanks — your message was sent. We will get back to you soon.');
      } else {
        setServerMessage(
          'Thanks — we received your message. Email delivery is not configured on this server; a teammate may still see it in logs.'
        );
      }
      form.reset();
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setServerMessage('Too many submissions. Please wait a few minutes and try again.');
        return;
      }
      setServerMessage('Something went wrong. Please try again in a moment.');
    }
  }

  const errors = form.formState.errors;
  const pending = form.formState.isSubmitting;

  return (
    <form className="mt-8 max-w-xl space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...form.register('name')}
        />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...form.register('email')}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input id="contact-subject" aria-invalid={!!errors.subject} {...form.register('subject')} />
        {errors.subject ? (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          rows={6}
          className={cn(
            'flex min-h-32 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-soft transition-shadow placeholder:text-muted-foreground/80 hover:border-primary/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
            'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30'
          )}
          aria-invalid={!!errors.message}
          {...form.register('message')}
        />
        {errors.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </div>
      {serverMessage ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
          {serverMessage}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" aria-hidden />
            Send message
          </>
        )}
      </Button>
    </form>
  );
}
