import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  
  // Public routes
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback', '/auth/signout'];
  const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/auth/');

  // Not logged in
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check profile completion for protected routes
  if (user && !isPublicRoute) {
    // Skip for profile completion page itself
    if (path === '/profile/complete') {
      return NextResponse.next();
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status, full_name')
      .eq('id', user.id)
      .single();
    
    // If no profile or not full verified, redirect to completion
    if (!profile?.full_name || profile.verification_status !== 'full') {
      return NextResponse.redirect(new URL('/profile/complete', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};