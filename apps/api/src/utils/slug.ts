import { randomBytes } from 'crypto';

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  const suffix = randomBytes(3).toString('hex');
  return `${base || 'hotel'}-${suffix}`;
}
