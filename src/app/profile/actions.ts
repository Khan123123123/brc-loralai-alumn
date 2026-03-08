"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  const isVerified = currentProfile?.verification_status === "full";

  // Parse standard fields
  const account_type = formData.get("account_type") as string;
  const full_name = formData.get("full_name") as string;
  const bio = formData.get("bio") as string;
  
  // BRC Details
  const entry_year = formData.get("entry_year") ? parseInt(formData.get("entry_year") as string) : null;
  const graduation_year = formData.get("graduation_year") ? parseInt(formData.get("graduation_year") as string) : null;
  const roll_number = formData.get("roll_number") as string;
  const regular_self_finance = formData.get("regular_self_finance") as string;

  // Location
  const current_city = formData.get("current_city") as string;
  const current_country = formData.get("current_country") as string;
  const home_city = formData.get("home_city") as string;
  const home_district = formData.get("home_district") as string;

  // Professional
  const profession = formData.get("profession") as string;
  const industry = formData.get("industry") as string;
  const current_position = formData.get("current_position") as string;
  const current_organization = formData.get("current_organization") as string;
  const employment_status = formData.get("employment_status") as string;
  const experience_years = formData.get("experience_years") ? parseInt(formData.get("experience_years") as string) : null;

  // Arrays (Jobs & Education)
  const job_history = JSON.parse((formData.get("job_history") as string) || "[]");
  const higher_education = JSON.parse((formData.get("higher_education") as string) || "[]");

  // Contact & Socials
  const phone_number = formData.get("phone_number") as string;
  const linkedin_url = formData.get("linkedin_url") as string;
  
  // Engaging Fields
  const languagesRaw = formData.get("languages") as string;
  const languages = languagesRaw ? languagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const achievements_brc = formData.get("achievements_brc") as string;
  const achievements_after = formData.get("achievements_after") as string;
  const favorite_teacher = formData.get("favorite_teacher") as string;
  const message_for_koharians = formData.get("message_for_koharians") as string;

  // Preferences (Only Phone is hideable now)
  const show_phone = formData.get("show_phone") === "on";
  const available_for_mentoring = formData.get("available_for_mentoring") === "on";

  const updates: any = {
    full_name,
    bio,
    account_type,
    entry_year,
    graduation_year,
    roll_number,
    regular_self_finance,
    current_city,
    current_country,
    home_city,
    home_district,
    profession,
    industry,
    current_position,
    current_organization,
    employment_status,
    experience_years,
    job_history,
    higher_education,
    phone_number,
    phone: phone_number, // Sync legacy field
    linkedin_url,
    languages,
    achievements_brc,
    achievements_after,
    favorite_teacher,
    message_for_koharians,
    show_phone,
    show_phone_publicly: show_phone, // Sync legacy
    show_email: true, // Always true for verified users
    show_email_publicly: true, // Always true
    show_linkedin_publicly: true, // Always true
    available_for_mentoring,
    is_profile_complete: true,
    updated_at: new Date().toISOString(),
  };

  if (!isVerified) {
    const houses = formData.get("verify_houses") as string;
    const teachers = formData.get("verify_teachers") as string;
    const staff = formData.get("verify_staff") as string;
    const principal = formData.get("verify_principal") as string;
    const established_year = formData.get("verify_established_year") as string;
    
    if (houses || teachers || staff || principal || established_year) {
      updates.verification_answers = { houses, teachers, staff, principal, established_year };
    }
  }

  updates.deep_search_text = `${full_name} ${profession} ${industry} ${current_organization} ${current_city} ${current_country} ${graduation_year} ${entry_year} ${roll_number}`.toLowerCase();

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/profile/me");
  revalidatePath("/directory");
  redirect("/profile/me");
}