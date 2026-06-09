import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Production Middleware
// ---------------------------------------------------------------------------
// This middleware runs on every incoming request before it reaches the
// application code. It enforces:
//   1. A strict Content-Security-Policy to mitigate XSS and injection attacks.
//   2. HSTS when NODE_ENV=production to force HTTPS.
//   3. General hardening headers that compliment next.config.js headers.
// ---------------------------------------------------------------------------

export function middleware(request) {
  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Content-Security-Policy: restrict where scripts, styles, and
  //    connections can originate. 'self' allows same-origin only.
  //    In production, you may need to add your analytics / CDN domains.
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Next.js requires 'unsafe-inline' for hydration
    "style-src 'self' 'unsafe-inline'",  // Tailwind injects inline styles during SSR
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://api.lemonsqueezy.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // 2. HTTP Strict-Transport-Security: force HTTPS in production.
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

// ---------------------------------------------------------------------------
// Matcher: run on all routes except static assets and the Next.js internals.
// ---------------------------------------------------------------------------
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
