/**
 * Stores the JWT in an httpOnly cookie so middleware can verify admin routes.
 * Call after successful login (and optionally after token refresh if you extend refresh handling).
 */
export async function syncAccessCookie(accessToken: string): Promise<void> {
  const res = await fetch('/api/auth/access-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? 'Could not set session cookie');
  }
}

export async function clearAccessCookie(): Promise<void> {
  await fetch('/api/auth/access-cookie', { method: 'DELETE', credentials: 'same-origin' });
}
