import { z } from 'zod';

export const siteSettingUpsertSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.string().min(0).max(50000),
});

export const siteSettingsBulkSchema = z.object({
  settings: z.array(siteSettingUpsertSchema).min(1).max(50),
});

export type SiteSettingUpsert = z.infer<typeof siteSettingUpsertSchema>;
