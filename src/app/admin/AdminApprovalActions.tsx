"use client";

import { useState } from "react";
import { updateProfileStatus } from "@/app/admin/action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      <Select 
        value={status} 
        onValueChange={handleStatusChange} 
        disabled={loading}
      >
        <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200">
          <SelectValue placeholder="Set Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending" className="text-yellow-700 font-medium">Pending Review</SelectItem>
          <SelectItem value="full" className="text-emerald-700 font-medium">Approved (Full)</SelectItem>
          <SelectItem value="limited" className="text-slate-700 font-medium">Limited Access</SelectItem>
          <SelectItem value="rejected" className="text-red-700 font-medium">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}