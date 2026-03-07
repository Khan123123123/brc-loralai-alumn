"use client";

import { useState } from "react";
import { updateProfileStatus, deleteUserAccount } from "@/app/admin/action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";

export function AdminApprovalActions({ 
  profileId, 
  currentStatus 
}: { 
  profileId: string; 
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: "full" | "pending" | "rejected" | "limited") => {
    setLoading(true);
    setStatus(newStatus);
    try {
      await updateProfileStatus(profileId, newStatus);
      window.location.reload();
    } catch (error) {
      alert("Error updating status: " + (error as Error).message);
      setStatus(currentStatus); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("DANGER: Are you absolutely sure you want to permanently delete this user account? This removes their login and all profile data and cannot be undone.")) return;
    
    setLoading(true);
    try {
      await deleteUserAccount(profileId);
      window.location.reload();
    } catch (error) {
      alert("Error deleting user: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      
      <Select 
        value={status} 
        onValueChange={handleStatusChange} 
        disabled={loading}
      >
        <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 focus:ring-secondary focus:border-secondary">
          <SelectValue placeholder="Set Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending" className="text-yellow-700 font-medium">Pending Review</SelectItem>
          <SelectItem value="full" className="text-emerald-700 font-medium">Approved (Full)</SelectItem>
          <SelectItem value="limited" className="text-slate-700 font-medium">Limited Access</SelectItem>
          <SelectItem value="rejected" className="text-red-700 font-medium">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <button 
        onClick={handleDelete}
        disabled={loading}
        title="Delete User"
        className="h-9 w-9 flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}