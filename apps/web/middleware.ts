import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'hotel_access';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path === '/admin' || path.startsWith('/admin/');
  const isManager = path === '/manager' || path.startsWith('/manager/');
  if (!isAdmin && !isManager) {
    return NextResponse.next();
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', path);
    login.searchParams.set('reason', 'misconfigured');
    return NextResponse.redirect(login);
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    const role = payload.role as string | undefined;

    if (isAdmin) {
      if (role === 'HOTEL_MANAGER') {
        const rest = path === '/admin' ? '' : path.slice('/admin'.length);
        return NextResponse.redirect(new URL(rest ? `/manager${rest}` : '/manager', request.url));
      }
      if (role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // /manager/*
    if (role === 'SUPER_ADMIN') {
      const rest = path === '/manager' ? '' : path.slice('/manager'.length);
      return NextResponse.redirect(new URL(rest ? `/admin${rest}` : '/admin', request.url));
    }
    if (role !== 'HOTEL_MANAGER') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  } catch {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/manager', '/manager/:path*'],
};
