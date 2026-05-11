import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(254).trim(),
  subject: z.string().min(1).max(200).trim(),
  message: z.string().min(1).max(8000).trim(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
