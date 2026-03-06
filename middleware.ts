import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/auth/auth-code-error'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'));

  if (!user && !isPublicRoute) return NextResponse.redirect(new URL('/auth/login', request.url));

  if (user && !isPublicRoute) {
    const { data: profile } = await supabase.from('profiles').select('verification_status').eq('id', user.id).single();
    if (!profile && pathname !== '/profile/complete') return NextResponse.redirect(new URL('/profile/complete', request.url));
    if ((pathname === '/directory' || pathname.startsWith('/directory')) && (!profile || !['basic', 'full'].includes(profile.verification_status))) {
      return NextResponse.redirect(new URL('/profile/me?message=verification_required', request.url));
    }
    if ((pathname === '/admin' || pathname.startsWith('/admin')) && user.email !== 'qaisrani12116@gmail.com') {
      return NextResponse.redirect(new URL('/directory', request.url));
    }
  }
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
