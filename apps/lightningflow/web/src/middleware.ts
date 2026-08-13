import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 🔐 HARDCODED ADMIN SECURITY
// Replace with your actual Supabase UUID from Auth > Users
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || 'your-uuid-here-replace-me';

// Optional: Development bypass (set ADMIN_BYPASS=true in .env.local for dev)
const ADMIN_BYPASS_ENABLED = process.env.ADMIN_BYPASS === 'true';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 🚀 DEVELOPMENT MODE: Skip all auth checks if bypass enabled
  if (IS_DEVELOPMENT && ADMIN_BYPASS_ENABLED) {
    console.log('⚠️  DEV MODE: Admin bypass enabled - skipping all auth checks');
    return response;
  }

  // Check for admin routes only in production or when bypass disabled
  if (req.nextUrl.pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              req.cookies.set({
                name,
                value,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: req.headers,
                },
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            },
            remove(name: string, options: CookieOptions) {
              req.cookies.set({
                name,
                value: '',
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: req.headers,
                },
              });
              response.cookies.set({
                name,
                value: '',
                ...options,
              });
            },
          },
        }
      );

      const { data: { user }, error } = await supabase.auth.getUser();

      // 🔒 HARDCODED SECURITY: Only allow specific UUID
      if (!user || error || user.id !== ADMIN_UID) {
        console.log(`🚨 Admin access denied: ${user?.id || 'no user'} (expected: ${ADMIN_UID})`);
        // Middleware pathnames are basePath-stripped; Next adds basePath on redirect.
        return NextResponse.redirect(new URL('/login', req.url));
      }

      console.log(`✅ Admin access granted: ${user.email} (${user.id})`);
      
    } catch (error) {
      console.error('🔥 Admin middleware error:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*'
    // Removed general matcher to avoid interfering with dashboard in dev mode
  ]
}; 