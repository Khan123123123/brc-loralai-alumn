"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateProfileStatus(profileId: string, newStatus: "full" | "pending" | "rejected" | "limited") {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  
  if (user?.email?.toLowerCase() !== adminEmail && user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized - Admin privileges required");
  }

  // Map the verification status to the corresponding admin_status
  const adminStatusMap = {
    full: "approved",
    pending: "pending",
    rejected: "rejected",
    limited: "pending"
  };

  const { error } = await serviceClient
    .from("profiles")
    .update({ 
      verification_status: newStatus,
      admin_status: adminStatusMap[newStatus],
      approved_at: newStatus === "full" ? new Date().toISOString() : null 
    })
    .eq("id", profileId);

  if (error) {
    console.error("Status update error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}