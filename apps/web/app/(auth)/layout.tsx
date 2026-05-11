import type { Metadata } from 'next';
import { GoogleOAuthProviderWrapper } from '@/components/google-oauth-provider';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProviderWrapper>
      <div className="bg-subtle-warm dark:bg-slate-950">{children}</div>
    </GoogleOAuthProviderWrapper>
  );
}
