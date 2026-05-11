import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import bundleAnalyzer from '@next/bundle-analyzer';
import withPWAInit from '@ducanh2912/next-pwa';

// Load the monorepo root `.env` BEFORE Next.js inlines NEXT_PUBLIC_* into the
// client bundle. This way there's a single source of truth for both apps. Any
// var already set in the real process env (e.g. Vercel project settings) wins,
// because dotenv does not override existing keys by default.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, '..', '..', '.env');
if (existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}

// Promote `<KEY>_PROD` -> `<KEY>` when building/running in production so the
// same .env can hold both local and deployed URLs/secrets.
if (process.env.NODE_ENV === 'production') {
  const map = {
    NEXT_PUBLIC_API_URL_PROD: 'NEXT_PUBLIC_API_URL',
    NEXT_PUBLIC_SITE_URL_PROD: 'NEXT_PUBLIC_SITE_URL',
    NEXT_PUBLIC_WEB_ORIGIN_PROD: 'NEXT_PUBLIC_WEB_ORIGIN',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    NEXT_PUBLIC_FIREBASE_API_KEY_PROD: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    NEXT_PUBLIC_FIREBASE_APP_ID_PROD: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    NEXT_PUBLIC_FIREBASE_VAPID_KEY_PROD: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
  };
  for (const [src, dst] of Object.entries(map)) {
    const v = process.env[src];
    if (v && v.trim()) process.env[dst] = v.trim();
  }
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/firebase-messaging-sw.js', destination: '/api/firebase-sw-js' }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
    ],
  },
};

export default withPWA(withBundleAnalyzer(nextConfig));
