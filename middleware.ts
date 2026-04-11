import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// Base security headers for all responses
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

// Content Security Policy
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method, headers } = request;
  const response = NextResponse.next();

  // 1. APPLY SECURITY HEADERS
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set('Content-Security-Policy', csp);

  // 2. CSRF PROTECTION (Origin/Referer Validation)
  // Enforce strict origin check for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = headers.get('origin');
    const referer = headers.get('referer');
    const host = headers.get('host');
    
    // In production, ensure origin matches host
    if (process.env.NODE_ENV === 'production') {
      if (!origin || !origin.includes(host || '')) {
         return new NextResponse(
           JSON.stringify({ message: 'CSRF Protection: Invalid Origin' }),
           { status: 403, headers: { 'Content-Type': 'application/json' } }
         );
      }
    }
  }

  // 3. PROTECTED ROUTES (RBAC)
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  
  if (isAdminRoute) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ message: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Decode token to check role
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      
      if (payload.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ message: 'Admin access required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
