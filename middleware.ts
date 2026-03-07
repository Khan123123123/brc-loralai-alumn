import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/callback",
  "/auth/signout",
];

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicRoute =
    PUBLIC_ROUTES.includes(path) || path.startsWith("/auth/");

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!user) {
    return NextResponse.next();
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const isAdmin = user.email?.toLowerCase() === adminEmail;

  if (path.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/directory", request.url));
  }

  if (path === "/profile/complete" || path === "/profile/me") {
    return NextResponse.next();
  }

  if (!isPublicRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("verification_status, full_name")
      .eq("id", user.id)
      .single();

    const hasFullAccess =
      Boolean(profile?.full_name) && profile?.verification_status === "full";

    if (!hasFullAccess) {
      return NextResponse.redirect(new URL("/profile/complete", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};