'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { apiJson, ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { toast } from 'sonner';

type Props = {
  bookingId: string;
  disabled?: boolean;
  size?: ButtonProps['size'];
  className?: string;
};

export function StripeCheckoutButton({ bookingId, disabled, size, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      size={size}
      className={className}
      disabled={disabled || loading}
      onClick={async () => {
        const token = getAccessToken();
        if (!token) {
          router.push(`/login?next=/book`);
          return;
        }
        setLoading(true);
        try {
          const { url } = await apiJson<{ url: string | null }>(
            `/api/v1/bookings/${bookingId}/checkout`,
            { method: 'POST', accessToken: token }
          );
          if (url) {
            window.location.href = url;
            return;
          }
          toast.error('Could not start checkout');
        } catch (e) {
          toast.error(e instanceof ApiError ? e.message : 'Checkout failed');
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Lock className="h-4 w-4" aria-hidden />
      )}
      {loading ? 'Redirecting…' : 'Pay with Stripe'}
    </Button>
  );
}
