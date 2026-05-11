import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-subtle-warm dark:bg-slate-950">{children}</div>;
}
