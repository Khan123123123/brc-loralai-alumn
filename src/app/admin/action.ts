"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveProfile(profileId: string, currentStatus: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "qaisrani12116@gmail.com") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      verification_status: "basic", 
      approved_at: new Date().toISOString() 
    })
    .eq("id", profileId);

  if (error) {
    console.error("Approval error:", error);
    throw error;
  }

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

  const { error } = await supabase
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

  const { error } = await supabase
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