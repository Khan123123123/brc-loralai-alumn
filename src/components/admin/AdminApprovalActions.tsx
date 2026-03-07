"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveProfile, rejectProfile } from "@/app/admin/action";
import { CheckCircle, XCircle } from "lucide-react";

export function AdminApprovalActions({ 
  profileId, 
  currentStatus 
}: { 
  profileId: string; 
  currentStatus: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      if (action === "approve") {
        await approveProfile(profileId, currentStatus);
      } else if (action === "reject") {
        await rejectProfile(profileId, currentStatus);
      }
      window.location.reload();
    } catch (error) {
      alert("Error: " + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => handleAction("approve")}
        disabled={!!loading}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        {loading === "approve" ? "..." : "Approve (Full)"}
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
        onClick={() => handleAction("reject")}
        disabled={!!loading}
      >
        <XCircle className="w-4 h-4 mr-1" />
        {loading === "reject" ? "..." : "Reject"}
      </Button>
    </div>
  );
}