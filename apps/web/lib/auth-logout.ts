import { API_BASE } from '@/lib/api';
import { setAccessToken, getAccessToken } from '@/lib/auth-storage';
import { clearAccessCookie } from '@/lib/sync-access-cookie';
import { setSessionRole } from '@/lib/session-role';
import { unregisterFcmClient } from '@/lib/firebase-messaging';

/** Clears refresh cookie on API, access token in sessionStorage, admin gate cookie, and role hint. */
export async function logoutClient(): Promise<void> {
  const accessToken = typeof window !== 'undefined' ? getAccessToken() : null;
  try {
    await unregisterFcmClient(accessToken);
  } catch {
    /* ignore */
  }
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    /* ignore */
  }
  setAccessToken(null);
  setSessionRole(null);
  try {
    await clearAccessCookie();
  } catch {
    /* ignore */
  }
}
