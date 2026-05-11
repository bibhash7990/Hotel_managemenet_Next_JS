import type { Env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { NotificationModel } from '../../models/mongo/Notification.js';
import { sendFcmToUser } from './send-fcm.js';

export async function notifyUser(
  env: Env,
  input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }
): Promise<void> {
  try {
    await NotificationModel.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      link: input.link,
    });
    void sendFcmToUser(env, {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
    });
  } catch (err) {
    logger.warn({ err, userId: input.userId }, 'Failed to persist notification');
  }
}
