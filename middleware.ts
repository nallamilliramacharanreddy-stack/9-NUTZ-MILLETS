import { NextResponse, NextRequest } from 'next/server';

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
    const host = headers.get('host');
    
    // [DEBUG-MIDDLEWARE] Log origin for 403 investigation
    console.log(`[CSRF-DEBUG] Method: ${method}, Path: ${pathname}, Origin: ${origin}, Host: ${host}`);

    // In production, ensure origin matches host
    if (process.env.NODE_ENV === 'production') {
      if (!origin || !origin.includes(host || '')) {
         console.warn(`[CSRF-BLOCKED] Path: ${pathname}, Origin: ${origin}, Host: ${host}`);
         return new NextResponse(
           JSON.stringify({ message: `CSRF Protection: Invalid Origin (${origin || 'none'})` }),
           { status: 403, headers: { 'Content-Type': 'application/json' } }
         );
      }
    }
  }

  // 3. PROTECTED ROUTES (RBAC)
  // [SEC-UPDATE] removing /api/orders from strict middleware block to allow user-level filtering in route handlers
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  
  if (isAdminRoute && method !== 'POST') { // Allow guest order POST
    const token = request.cookies.get('accessToken')?.value || headers.get('authorization')?.split(' ')[1];
    
    console.log(`[AUTH-DEBUG-MIDDLEWARE] Path: ${pathname}, TokenFound: ${!!token}`);

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
      // Decode token to check role (Base64URL safe decoding for Edge Runtime)
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) throw new Error("Invalid token format");
      
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      const payload = JSON.parse(atob(padded));
      
      console.log(`[AUTH-DEBUG] Path: ${pathname}, UserRole: ${payload.role}`);

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
      console.error("[AUTH-ERROR] Middleware decoding failed:", e);
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
