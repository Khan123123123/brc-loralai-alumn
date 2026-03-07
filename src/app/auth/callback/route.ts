import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/directory";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_profile_complete")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(`${origin}/profile/complete`);
  }

  if (!profile.is_profile_complete) {
    return NextResponse.redirect(`${origin}/profile/complete`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}