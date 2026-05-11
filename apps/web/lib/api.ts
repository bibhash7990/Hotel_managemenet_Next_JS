export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type ApiErrorBody = { error?: string; code?: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorBody
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit & { accessToken?: string | null }
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (init?.accessToken) {
    headers.set('Authorization', `Bearer ${init.accessToken}`);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-json
  }
  if (!res.ok) {
    const err = json as ApiErrorBody | null;
    throw new ApiError((err?.error ?? text) || 'Request failed', res.status, err ?? undefined);
  }
  return json as T;
}
