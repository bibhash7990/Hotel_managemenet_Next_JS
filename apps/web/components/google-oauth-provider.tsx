'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function GoogleOAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  if (!clientId.trim()) {
    return children;
  }
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
