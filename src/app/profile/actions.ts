"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function deleteMyAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized - User not found");
  }

  // Create an admin-level client to bypass RLS and Auth restrictions for deletion
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Delete the user's profile record
  await serviceClient.from("profiles").delete().eq("id", user.id);
  
  // 2. Delete the user from the Supabase Auth system
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}