'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({
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
      ? 'The admin dashboard could not load this section. Try again or go back to the rest of the site.'
      : error.message;

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-heading-2">Admin — chart or data error</h1>
      <p className="mt-3 text-body text-muted-foreground dark:text-slate-400" role="alert">
        {message}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Button type="button" variant="secondary" onClick={() => (window.location.href = '/')}>
          Home
        </Button>
      </div>
    </div>
  );
}
