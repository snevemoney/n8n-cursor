import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basic auth middleware for ops dashboard
export function middleware(req: NextRequest) {
  // Skip auth for health checks
  if (req.nextUrl.pathname === '/healthz') {
    return NextResponse.next();
  }

  // In development, allow access
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // In production, check for basic auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Ops Dashboard"',
      },
    });
  }

  // For now, allow all authenticated requests
  // In production, you'd validate the credentials
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!healthz|_next|favicon.ico).*)"],
};