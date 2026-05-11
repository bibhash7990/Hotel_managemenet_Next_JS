const KEY = 'hotel_access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, token);
}
