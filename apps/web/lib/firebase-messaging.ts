import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, deleteToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';
import { apiJson } from '@/lib/api';
import { getFirebaseWebConfig, isFirebaseWebConfigured } from '@/lib/firebase-web-config';

const FCM_STORAGE_KEY = 'hotel_fcm_reg_token';

let foregroundListenerAttached = false;

function attachForegroundListener(messaging: ReturnType<typeof getMessaging>): void {
  if (foregroundListenerAttached) return;
  foregroundListenerAttached = true;
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'Notification';
    const body = payload.notification?.body;
    toast(title, body ? { description: body } : undefined);
  });
}

export async function registerFcmClient(accessToken: string): Promise<void> {
  if (typeof window === 'undefined' || !isFirebaseWebConfigured()) return;
  if (!(await isSupported())) return;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return;

  if (Notification.permission === 'denied') return;
  if (Notification.permission === 'default') {
    const p = await Notification.requestPermission();
    if (p !== 'granted') return;
  }

  const cfg = getFirebaseWebConfig();
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
  const messaging = getMessaging(app);

  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: reg,
  });
  if (!token) return;

  await apiJson<{ ok: boolean }>('/api/v1/notifications/push/register', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ token }),
  });
  sessionStorage.setItem(FCM_STORAGE_KEY, token);
  attachForegroundListener(messaging);
}

export async function unregisterFcmClient(accessToken: string | null): Promise<void> {
  if (typeof window === 'undefined') return;
  const stored = sessionStorage.getItem(FCM_STORAGE_KEY);
  if (!accessToken || !stored) {
    sessionStorage.removeItem(FCM_STORAGE_KEY);
    return;
  }

  try {
    await apiJson<{ ok: boolean }>(
      `/api/v1/notifications/push/register?token=${encodeURIComponent(stored)}`,
      {
        method: 'DELETE',
        accessToken,
      }
    );
  } catch {
    /* ignore */
  }

  if (isFirebaseWebConfigured()) {
    try {
      const cfg = getFirebaseWebConfig();
      const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
      const messaging = getMessaging(app);
      await deleteToken(messaging);
    } catch {
      /* ignore */
    }
  }

  sessionStorage.removeItem(FCM_STORAGE_KEY);
}
