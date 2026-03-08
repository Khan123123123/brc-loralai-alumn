"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service role client - bypasses ALL RLS---
const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateProfileStatus(profileId: string, uiStatus: "full" | "pending" | "rejected" | "limited") {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  
  if (user?.email?.toLowerCase() !== adminEmail && user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized - Admin privileges required");
  }

  let dbUpdate = {};

  switch (uiStatus) {
    case "full":
      dbUpdate = { verification_status: "full", access_level: "full", admin_status: "approved", approved_at: new Date().toISOString() };
      break;
    case "pending":
      dbUpdate = { verification_status: "pending", access_level: "limited", admin_status: "pending", approved_at: null };
      break;
    case "rejected":
      dbUpdate = { verification_status: "rejected", access_level: "limited", admin_status: "rejected", approved_at: null };
      break;
    case "limited":
      dbUpdate = { verification_status: "basic", access_level: "limited", admin_status: "pending", approved_at: null };
      break;
  }

  const { error } = await serviceClient.from("profiles").update(dbUpdate).eq("id", profileId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  
  if (user?.email?.toLowerCase() !== adminEmail && user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized - Admin privileges required");
  }

  // 1. Delete profile
  const { error: profileError } = await serviceClient.from("profiles").delete().eq("id", userId);
  if (profileError) throw new Error("Failed to delete profile: " + profileError.message);

  // 2. Delete Auth record
  const { error: authError } = await serviceClient.auth.admin.deleteUser(userId);
  if (authError) throw new Error("Failed to delete auth user: " + authError.message);

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}

// Kept for fallback compatibility if needed
export async function approveProfile(profileId: string) { return updateProfileStatus(profileId, "full"); }
export async function rejectProfile(profileId: string) { return updateProfileStatus(profileId, "rejected"); }

// ------------------------------------------------------------------
// NEW: ANNOUNCEMENT BOARD ACTIONS
// ------------------------------------------------------------------

export async function createAnnouncement(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "qaisrani12116@gmail.com";
  
  if (user?.email?.toLowerCase() !== adminEmail) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const type = formData.get("type") as string;
  const link_url = formData.get("link_url") as string;

  const { error } = await serviceClient.from("announcements").insert({
    title, content, type, link_url: link_url || null
  });

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/announcements");
  revalidatePath("/directory");
}

export async function deleteAnnouncement(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "qaisrani12116@gmail.com";
  if (user?.email?.toLowerCase() !== adminEmail) throw new Error("Unauthorized");

  await serviceClient.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/directory");
}

export async function toggleAnnouncementStatus(id: string, currentStatus: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "qaisrani12116@gmail.com";
  if (user?.email?.toLowerCase() !== adminEmail) throw new Error("Unauthorized");

  await serviceClient.from("announcements").update({ is_active: !currentStatus }).eq("id", id);
  revalidatePath("/admin/announcements");
  revalidatePath("/directory");
}