'use client';

import { useEffect } from 'react';
import { registerFcmClient } from '@/lib/firebase-messaging';

/** Registers FCM when the user is signed in and Firebase web env is configured. */
export function FcmRegister({ accessToken }: { accessToken: string | null }) {
  useEffect(() => {
    if (!accessToken) return;
    void registerFcmClient(accessToken).catch(() => undefined);
  }, [accessToken]);

  return null;
}
