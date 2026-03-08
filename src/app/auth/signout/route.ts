import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force the route to be dynamic so Vercel doesn't cache the redirect
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  // request.url automatically captures the exact current domain (localhost or Vercel)
  // preventing the DEPLOYMENT_NOT_FOUND error
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}