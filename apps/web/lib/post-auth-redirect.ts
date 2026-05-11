'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';
import { setAccessToken } from '@/lib/auth-storage';
import { syncAccessCookie } from '@/lib/sync-access-cookie';
import { isHotelManagerRole, isSuperAdminRole, setSessionRole } from '@/lib/session-role';

export type AuthSessionPayload = {
  accessToken: string;
  user: { id: string; email: string; name: string; role: string; emailVerified: boolean };
};

export async function applySessionAndRedirect(
  router: AppRouterInstance,
  nextPath: string,
  res: AuthSessionPayload,
  toastMessage = 'Welcome back'
): Promise<void> {
  setAccessToken(res.accessToken);
  setSessionRole(res.user.role);
  try {
    await syncAccessCookie(res.accessToken);
  } catch {
    /* cookie mirror optional if JWT_ACCESS_SECRET missing on web */
  }
  const isDefaultDestination = nextPath === '/dashboard' || nextPath === '/';
  const destination =
    isDefaultDestination && isSuperAdminRole(res.user.role)
      ? '/admin'
      : isDefaultDestination && isHotelManagerRole(res.user.role)
        ? '/manager'
        : nextPath;
  toast.success(toastMessage);
  router.push(destination);
  router.refresh();
}
