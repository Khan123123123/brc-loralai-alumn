import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { ShieldCheck } from "lucide-react";

export default async function CompleteProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Only redirect if the actual auth session is missing
  if (!user) {
    redirect("/auth/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  // FIX: If profile is missing from DB, DO NOT redirect to login.
  // This was causing the redirect bounce to the home page! 
  // Instead, create a safe fallback profile so the form can load.
  if (!profile) {
    profile = {
      id: user.id,
      is_profile_complete: false,
      full_name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      verification_status: "pending",
      admin_status: "pending",
      access_level: "limited"
    };
  }

  const isVerified = profile.verification_status === "full" || profile.admin_status === "approved" || profile.access_level === "full";
  const answers = profile.verification_answers || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {profile.is_profile_complete ? "Edit Your Profile" : "Complete Your Profile"}
        </h1>
        <p className="mt-2 text-slate-600">Follow the steps below to update your information.</p>
        
        {isVerified && (
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5" /> Your account is officially verified.
          </div>
        )}
      </div>

      <ProfileForm profile={profile} answers={answers} isVerified={isVerified} />
    </div>
  );
}