import { Router } from 'express';
import type { Request, Response } from 'express';
import { contactFormSchema } from '@hotel/shared';
import type { Env } from '../../config/env.js';
import { sendMail } from '../../lib/email.js';

export function createContactRouter(env: Env): Router {
  const r = Router();

  r.post('/', async (req: Request, res: Response, next) => {
    try {
      const body = contactFormSchema.parse(req.body);
      const to = (env.CONTACT_TO_EMAIL?.trim() || env.EMAIL_FROM).trim();
      const text = `From: ${body.name} <${body.email}>\n\nSubject: ${body.subject}\n\n${body.message}`;
      const { delivered } = await sendMail(env, {
        to,
        subject: `[StayHub contact] ${body.subject}`,
        text,
        html: `<p><strong>From:</strong> ${escapeHtml(body.name)} &lt;${escapeHtml(body.email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(body.message)}</pre>`,
      });
      res.json({ ok: true, delivered });
    } catch (e) {
      next(e);
    }
  });

  return r;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
