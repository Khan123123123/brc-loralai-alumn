"use client";

import { useState } from "react";
import { updateProfileStatus, deleteUserAccount } from "@/app/admin/action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function AdminApprovalActions({ 
  profileId, 
  currentStatus 
}: { 
  profileId: string; 
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  // Default to pending visually if they aren't fully verified yet
  const [status, setStatus] = useState(currentStatus === 'full' ? 'full' : 'pending');

  const handleStatusChange = async (newStatus: "full" | "pending" | "rejected") => {
    setLoading(true);
    setStatus(newStatus);
    try {
      await updateProfileStatus(profileId, newStatus);
      window.location.reload();
    } catch (error) {
      alert("Error updating status: " + (error as Error).message);
      setStatus(currentStatus === 'full' ? 'full' : 'pending');
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
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 min-w-[140px]">
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
          <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 focus:ring-secondary focus:border-secondary">
            <SelectValue placeholder="Set Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending" className="text-amber-700 font-medium">Unverified</SelectItem>
            <SelectItem value="full" className="text-emerald-700 font-medium">Verified</SelectItem>
            <SelectItem value="rejected" className="text-red-700 font-medium">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleDelete}
        disabled={loading}
        variant="destructive"
        size="sm"
        className="h-7 px-3 text-xs gap-1 w-[140px]"
      >
        <Trash2 className="w-3 h-3" /> Delete User
      </Button>
    </div>
  );
}