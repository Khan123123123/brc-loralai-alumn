import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function handleSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    { status: 302 }
  );
}

export async function GET() {
  return handleSignOut();
}

export async function POST() {
  return handleSignOut();
}