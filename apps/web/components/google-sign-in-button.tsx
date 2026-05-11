'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { apiJson, ApiError } from '@/lib/api';
import { applySessionAndRedirect, type AuthSessionPayload } from '@/lib/post-auth-redirect';
import { toast } from 'sonner';

type Props = {
  nextPath: string;
  /** Shown after first-time Google registration vs returning user */
  welcomeNewUser?: boolean;
};

export function GoogleSignInButton({ nextPath, welcomeNewUser }: Props) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  if (!clientId.trim()) {
    return null;
  }

  return (
    <div className="flex w-full justify-center [&>div]:w-full [&_iframe]:mx-auto">
      <GoogleLogin
        size="large"
        text={welcomeNewUser ? 'signup_with' : 'continue_with'}
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          if (!idToken) {
            toast.error('Google did not return a credential');
            return;
          }
          try {
            const res = await apiJson<AuthSessionPayload & { expiresIn: number }>(
              '/api/v1/auth/google',
              {
                method: 'POST',
                body: JSON.stringify({ idToken }),
              }
            );
            await applySessionAndRedirect(
              router,
              nextPath,
              res,
              welcomeNewUser ? 'Account ready' : 'Welcome back'
            );
          } catch (e: unknown) {
            if (e instanceof ApiError && e.status === 409) {
              toast.error('This email is already registered. Sign in with email and password.');
            } else {
              toast.error(e instanceof ApiError ? e.message : 'Google sign-in failed');
            }
          }
        }}
        onError={() => {
          toast.error('Google sign-in was cancelled or failed');
        }}
      />
    </div>
  );
}
