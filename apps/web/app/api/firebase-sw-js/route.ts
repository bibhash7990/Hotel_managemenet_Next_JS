import { NextResponse } from 'next/server';

const FIREBASE_JS = '11.10.0';

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };

  if (!config.apiKey || !config.projectId) {
    return new NextResponse(
      '// StayHub: set NEXT_PUBLIC_FIREBASE_* in .env to enable FCM service worker\n',
      { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
    );
  }

  const body = `importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_JS}/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_JS}/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification && payload.notification.title ? payload.notification.title : 'StayHub';
  const bodyText =
    payload.notification && payload.notification.body ? payload.notification.body : '';
  const options = {
    body: bodyText,
    icon: '/favicon.ico',
    data: payload.data || {},
  };
  return self.registration.showNotification(title, options);
});
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
