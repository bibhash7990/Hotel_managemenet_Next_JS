/** Web Firebase client config (public keys only). */
export function getFirebaseWebConfig(): {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };
}

export function isFirebaseWebConfigured(): boolean {
  const c = getFirebaseWebConfig();
  return Boolean(
    c.apiKey &&
    c.projectId &&
    c.messagingSenderId &&
    c.appId &&
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
}
