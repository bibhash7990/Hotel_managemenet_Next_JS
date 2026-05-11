'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-serif text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message || 'Please try again.'}</p>
      <div className="mt-8 flex gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" onClick={() => (window.location.href = '/')}>
          Home
        </Button>
      </div>
    </div>
  );
}
