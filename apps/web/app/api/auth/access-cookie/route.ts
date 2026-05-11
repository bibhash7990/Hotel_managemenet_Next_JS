import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'hotel_access';
const MAX_AGE = 15 * 60;

function getSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be set (min 32 chars) for access cookie');
  }
  return new TextEncoder().encode(s);
}

/** Mirrors Bearer access token into an httpOnly cookie so Edge middleware can gate /admin and /manager. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken required' }, { status: 400 });
    }
    await jwtVerify(accessToken, getSecret(), { algorithms: ['HS256'] });
    const jar = await cookies();
    jar.set(COOKIE, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid token';
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE);
  return NextResponse.json({ ok: true });
}
