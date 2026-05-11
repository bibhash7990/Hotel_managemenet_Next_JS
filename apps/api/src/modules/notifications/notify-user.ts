import { logger } from '../../lib/logger.js';
import { NotificationModel } from '../../models/mongo/Notification.js';

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    await NotificationModel.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      link: input.link,
    });
  } catch (err) {
    logger.warn({ err, userId: input.userId }, 'Failed to persist notification');
  }
}
