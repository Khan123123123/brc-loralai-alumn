"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMyAccount } from "@/app/profile/actions";

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("DANGER: Are you absolutely sure you want to permanently delete your account and profile data? This action cannot be undone.")) return;
    
    setLoading(true);
    const res = await deleteMyAccount();
    
    if (res?.error) {
      alert("Error deleting account: " + res.error);
      setLoading(false);
    } else {
      window.location.href = "/auth/login";
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete} 
      disabled={loading} 
      className="gap-2 font-bold rounded-xl w-full sm:w-auto mt-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Permanently Delete My Account
    </Button>
  );
}