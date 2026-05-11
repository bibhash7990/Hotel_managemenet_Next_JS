import nodemailer from 'nodemailer';
import type { Env } from '../config/env.js';
import { logger } from './logger.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(env: Env): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_PORT) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

export type SendMailResult = { delivered: boolean };

/**
 * Sends email when SMTP is configured. Never throws after handoff to the
 * transporter — failures are logged so API flows (e.g. register) can degrade
 * gracefully without leaving inconsistent success responses.
 */
export async function sendMail(
  env: Env,
  opts: { to: string; subject: string; text: string; html?: string }
): Promise<SendMailResult> {
  const t = getTransporter(env);
  if (!t) {
    logger.info({ to: opts.to, subject: opts.subject }, 'Email skipped (no SMTP configured)');
    return { delivered: false };
  }
  try {
    await t.sendMail({
      from: env.EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text,
    });
    return { delivered: true };
  } catch (err) {
    logger.error({ err, to: opts.to, subject: opts.subject }, 'sendMail failed');
    return { delivered: false };
  }
}
