import type { Env } from '../../config/env.js';
import { getMessagingOrNull } from '../../lib/firebase-admin.js';
import { logger } from '../../lib/logger.js';
import { FcmTokenModel } from '../../models/mongo/FcmToken.js';

const PRUNE_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
  'messaging/unregistered',
]);

function clickUrl(env: Env, link?: string): string {
  if (!link) return env.WEB_ORIGIN;
  const path = link.startsWith('/') ? link : `/${link}`;
  return new URL(path, env.WEB_ORIGIN).href;
}

export async function sendFcmToUser(
  env: Env,
  input: { userId: string; title: string; message: string; type: string; link?: string }
): Promise<void> {
  const messaging = getMessagingOrNull(env);
  if (!messaging) return;

  const docs = await FcmTokenModel.find({ userId: input.userId }).select('token').lean();
  const tokenStrings = docs.map((d) => d.token).filter(Boolean);
  if (tokenStrings.length === 0) return;

  const data: Record<string, string> = {
    type: input.type,
    title: input.title,
    body: input.message,
  };
  if (input.link) data.link = input.link;

  const openUrl = clickUrl(env, input.link);

  try {
    const res = await messaging.sendEachForMulticast({
      tokens: tokenStrings,
      notification: { title: input.title, body: input.message },
      data,
      webpush: {
        fcmOptions: { link: openUrl },
      },
    });

    res.responses.forEach((r, i) => {
      if (!r.success && r.error?.code && PRUNE_CODES.has(r.error.code)) {
        const t = tokenStrings[i];
        void FcmTokenModel.deleteOne({ token: t }).catch(() => undefined);
      }
    });

    if (res.failureCount > 0) {
      logger.warn(
        { userId: input.userId, failureCount: res.failureCount, successCount: res.successCount },
        'FCM multicast partial failure'
      );
    }
  } catch (err) {
    logger.warn({ err, userId: input.userId }, 'FCM send failed');
  }
}
