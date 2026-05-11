import { ValidationError } from '../lib/errors.js';

export function routeParam(value: string | string[] | undefined, name = 'id'): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }
  throw new ValidationError(`Missing route parameter: ${name}`);
}
