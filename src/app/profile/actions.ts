"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
   const { data: currentProfile } = await supabase
      .from("profiles")
      .select("verification_status, full_name")
      .eq("id", user.id)
      .single();
    const isVerified = currentProfile?.verification_status === "full";

    const getString = (key: string) => {
      const val = formData.get(key);
      return val ? String(val).trim() : null;
    };
    
    const getInt = (key: string) => {
      const val = formData.get(key);
      if (!val) return null;
      const str = String(val).trim();
      if (str === "") return null;
      const parsed = parseInt(str, 10);
      return isNaN(parsed) ? null : parsed;
    };

    let job_history = [];
    let higher_education = [];
    try { job_history = JSON.parse(getString("job_history") || "[]"); } catch (e) {}
    try { higher_education = JSON.parse(getString("higher_education") || "[]"); } catch (e) {}

    const languagesRaw = getString("languages");
    const languages = languagesRaw ? languagesRaw.split(',').map(s => s.trim()).filter(Boolean) : null;
    
    const subjectsRaw = getString("subjects_taught");
    const subjects_taught = subjectsRaw ? subjectsRaw.split(',').map(s => s.trim()).filter(Boolean) : null;

    const accountType = getString("account_type") || "Alumni";

    // Clean, direct mapping to your guaranteed database columns!
    const updates: any = {
      id: user.id, 
      email: user.email, 
full_name: getString("full_name") || currentProfile?.full_name || user.user_metadata?.full_name || "Koharian",      bio: getString("bio"),
      account_type: accountType,
      profile_photo_url: getString("profile_photo_url"),
      
      entry_year: getInt("entry_year"),
      graduation_year: getInt("graduation_year"),
      
      achievements_brc: getString("achievements_brc"),
      achievements_after: getString("achievements_after"),
      message_for_koharians: getString("message_for_koharians"),
      
      current_city: getString("current_city"),
      current_country: getString("current_country"),
      home_city: getString("home_city"),
      home_district: getString("home_district"),
      
      profession: getString("profession"),
      industry: getString("industry"),
      current_position: getString("current_position"),
      current_organization: getString("current_organization"),
      employment_status: getString("employment_status"),
      experience_years: getInt("experience_years"),
      
      job_history,
      higher_education,
      languages,
      
      phone_number: getString("phone_number"), 
      linkedin_url: getString("linkedin_url"),
      twitter_url: getString("twitter_url"),
      website_url: getString("website_url"),
      
      // Removed the redundant "show_email" and "show_phone" to stop the schema crashes
      show_phone_publicly: formData.get("show_phone") === "on",
      show_email_publicly: true,
      show_linkedin_publicly: true,
      show_in_directory: true, 
      available_for_mentoring: formData.get("available_for_mentoring") === "on",
      
      is_profile_complete: true,
      updated_at: new Date().toISOString(),
    };

    if (accountType !== "Faculty") {
      updates.roll_number = getString("roll_number");
      updates.regular_self_finance = getString("regular_self_finance");
      updates.student_type = getString("student_type");
      updates.favorite_teacher = getString("favorite_teacher");
      updates.subjects_taught = null;
    } else {
      updates.subjects_taught = subjects_taught;
      updates.roll_number = null;
      updates.regular_self_finance = null;
      updates.student_type = null;
      updates.favorite_teacher = null;
    }

    if (!isVerified) {
      const houses = getString("verify_houses");
      const teachers = getString("verify_teachers");
      const staff = getString("verify_staff");
      const principal = getString("verify_principal");
      const established_year = getString("verify_established_year");
      
      if (houses || teachers || staff || principal || established_year) {
        updates.verification_answers = { houses, teachers, staff, principal, established_year };
      }
    }

    // Bulletproof Upsert
    const { error } = await supabase.from("profiles").upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Supabase Error:", error.message);
      return { error: error.message }; 
    }

    revalidatePath("/profile/me");
    revalidatePath("/directory");
    
    return { success: true };

  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { error: err.message || "An unexpected server error occurred." };
  }
}

export async function deleteMyAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const { error: dbError } = await serviceClient.from("profiles").delete().eq("id", user.id);
    if (dbError) throw new Error(dbError.message);

    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(authError.message);

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete account." };
  }
}