"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service role client - bypasses ALL RLS
const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateProfileStatus(profileId: string, uiStatus: "full" | "pending" | "rejected" | "limited") {
  const supabase = createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  
  if (user?.email?.toLowerCase() !== adminEmail && user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized - Admin privileges required");
  }

  // Safely map the UI dropdown status to strict database column constraints
  let dbUpdate = {};

  switch (uiStatus) {
    case "full":
      dbUpdate = {
        verification_status: "full",
        access_level: "full",
        admin_status: "approved",
        approved_at: new Date().toISOString()
      };
      break;
    case "pending":
      dbUpdate = {
        verification_status: "pending",
        access_level: "limited",
        admin_status: "pending",
        approved_at: null
      };
      break;
    case "rejected":
      dbUpdate = {
        verification_status: "rejected",
        access_level: "limited",
        admin_status: "rejected",
        approved_at: null
      };
      break;
    case "limited":
      // "limited" UI state maps to "basic" verification and "limited" access level
      dbUpdate = {
        verification_status: "basic", 
        access_level: "limited",
        admin_status: "pending",
        approved_at: null
      };
      break;
  }

  const { error } = await serviceClient
    .from("profiles")
    .update(dbUpdate)
    .eq("id", profileId);

  if (error) {
    console.error("Status update error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}

// Keep these exports as pass-throughs just in case any old components are still looking for them
export async function approveProfile(profileId: string) {
  return updateProfileStatus(profileId, "full");
}

export async function rejectProfile(profileId: string) {
  return updateProfileStatus(profileId, "rejected");
}