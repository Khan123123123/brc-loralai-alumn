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
  const entry_year = formData.get("entry_year") ? parseInt(formData.get("entry_year") as string) : null;
  const graduation_year = formData.get("graduation_year") ? parseInt(formData.get("graduation_year") as string) : null;
  
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

  // Preferences
  const show_email = formData.get("show_email") === "on";
  const show_phone = formData.get("show_phone") === "on";
  const available_for_mentoring = formData.get("available_for_mentoring") === "on";
  const show_in_directory = formData.get("show_in_directory") !== "off";

  const updates: any = {
    full_name,
    bio,
    account_type,
    entry_year,
    graduation_year,
    current_city,
    current_country,
    home_city,
    home_district,
    profession,
    industry,
    current_position,
    current_organization,
    phone_number,
    linkedin_url,
    languages,
    achievements_brc,
    achievements_after,
    favorite_teacher,
    message_for_koharians,
    show_email,
    show_phone,
    available_for_mentoring,
    show_in_directory,
    is_profile_complete: true,
    updated_at: new Date().toISOString(),
  };

  // ONLY process verification answers if the user is NOT already verified
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

  // Update deep search text
  updates.deep_search_text = `${full_name} ${profession} ${industry} ${current_organization} ${current_city} ${current_country} ${graduation_year} ${entry_year}`.toLowerCase();

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile/me");
  revalidatePath("/directory");
  redirect("/profile/me");
}