'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. You can try again or return home.'
      : error.message;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive shadow-soft">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-destructive">
        Unexpected error
      </p>
      <h1 className="mt-2 font-serif text-display leading-tight">We hit a snag.</h1>
      <p
        className="mt-3 max-w-md text-body text-muted-foreground dark:text-slate-400"
        role="alert"
      >
        {message}
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground/70">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = '/')}
        >
          <Home className="h-4 w-4" aria-hidden />
          Go home
        </Button>
      </div>
    </div>
  );
}
