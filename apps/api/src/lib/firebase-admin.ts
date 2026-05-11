import admin from 'firebase-admin';
import type { Env } from '../config/env.js';
import { logger } from './logger.js';

let initAttempted = false;
let initOk = false;

export function getMessagingOrNull(env: Env): admin.messaging.Messaging | null {
  if (!initAttempted) {
    initAttempted = true;
    try {
      if (admin.apps.length > 0) {
        initOk = true;
      } else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
        initOk = true;
      } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        initOk = true;
      }
    } catch (err) {
      logger.warn({ err }, 'Firebase Admin initialization failed');
      initOk = false;
    }
  }
  if (!initOk) return null;
  return admin.messaging();
}
