"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const verifyAdminAccess = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const userEmail = user?.email?.toLowerCase() || "";
  
  if (!userEmail || (userEmail !== adminEnvEmail && userEmail !== "qaisrani12116@gmail.com" && userEmail !== "brcloralai123@gmail.com")) {
    throw new Error("Unauthorized");
  }
};

export async function updateProfileStatus(profileId: string, uiStatus: "full" | "pending" | "rejected" | "limited") {
  await verifyAdminAccess();
  let dbUpdate = {};
  switch (uiStatus) {
    case "full": dbUpdate = { verification_status: "full", access_level: "full", admin_status: "approved", approved_at: new Date().toISOString() }; break;
    case "pending": dbUpdate = { verification_status: "pending", access_level: "limited", admin_status: "pending", approved_at: null }; break;
    case "rejected": dbUpdate = { verification_status: "rejected", access_level: "limited", admin_status: "rejected", approved_at: null }; break;
    case "limited": dbUpdate = { verification_status: "basic", access_level: "limited", admin_status: "pending", approved_at: null }; break;
  }
  const { error } = await serviceClient.from("profiles").update(dbUpdate).eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin"); revalidatePath("/directory");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  await verifyAdminAccess();
  await serviceClient.from("profiles").delete().eq("id", userId);
  await serviceClient.auth.admin.deleteUser(userId);
  revalidatePath("/admin"); revalidatePath("/directory");
  return { success: true };
}

export async function toggleFeaturedStatus(id: string, currentStatus: boolean) {
  await verifyAdminAccess();
  await serviceClient.from("profiles").update({ featured_in_presentation: !currentStatus }).eq("id", id);
  revalidatePath("/admin"); revalidatePath("/directory");
}

export async function createAnnouncement(formData: FormData) {
  await verifyAdminAccess();
  await serviceClient.from("announcements").insert({
    title: formData.get("title"), content: formData.get("content"), type: formData.get("type"), link_url: formData.get("link_url") || null
  });
  revalidatePath("/admin/announcements"); revalidatePath("/directory");
}

export async function deleteAnnouncement(id: string) {
  await verifyAdminAccess();
  await serviceClient.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/announcements"); revalidatePath("/directory");
}

export async function toggleAnnouncementStatus(id: string, currentStatus: boolean) {
  await verifyAdminAccess();
  await serviceClient.from("announcements").update({ is_active: !currentStatus }).eq("id", id);
  revalidatePath("/admin/announcements"); revalidatePath("/directory");
}