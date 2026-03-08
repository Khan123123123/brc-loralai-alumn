import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/utils/access";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/callback",
  "/auth/signout",
  "/auth/auth-code-error",
];

const ALWAYS_ALLOWED_FOR_LOGGED_IN_USERS = [
  "/profile/complete",
  "/profile/me",
  "/directory",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth/");
}

function isAlwaysAllowedForLoggedInUsers(pathname: string) {
  return (
    ALWAYS_ALLOWED_FOR_LOGGED_IN_USERS.includes(pathname) ||
    pathname.startsWith("/directory/")
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!user) {
    return NextResponse.next();
  }

  // BULLETPROOF ADMIN CHECK (Bypasses Vercel env cache issues)
  const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const userEmail = user.email?.toLowerCase() || "";
  const isAdmin = userEmail === adminEnvEmail || userEmail === "brcloralai123@gmail.com";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/directory", request.url));
  }

  if (isAlwaysAllowedForLoggedInUsers(pathname)) {
    return NextResponse.next();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("access_level, admin_status, verification_status")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(profile)) {
    return NextResponse.redirect(new URL("/directory", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};