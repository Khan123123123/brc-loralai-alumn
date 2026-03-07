"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service role client bypasses RLS
const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function approveProfile(profileId: string, currentStatus: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized");
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ 
      verification_status: "basic", 
      approved_at: new Date().toISOString() 
    })
    .eq("id", profileId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}

export async function rejectProfile(profileId: string, currentStatus: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized");
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ 
      verification_status: "rejected",
      approved_at: null
    })
    .eq("id", profileId);

  if (error) throw error;

  revalidatePath("/admin");
  return { success: true };
}

export async function fullVerifyProfile(profileId: string, currentStatus: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized");
  }

  const { error } = await serviceClient
    .from("profiles")
    .update({ 
      verification_status: "full", 
      approved_at: new Date().toISOString() 
    })
    .eq("id", profileId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/directory");
  return { success: true };
}