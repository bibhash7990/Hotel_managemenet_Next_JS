import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const next = typeof searchParams.next === 'string' ? searchParams.next : '/dashboard';
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-500">Loading…</p>}>
      <LoginForm nextPath={next} />
    </Suspense>
  );
}
