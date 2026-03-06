"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveProfile, rejectProfile, fullVerifyProfile } from "@/app/admin/action";
import { CheckCircle, XCircle, Shield } from "lucide-react";

export function AdminApprovalActions({ 
  profileId, 
  currentStatus 
}: { 
  profileId: string; 
  currentStatus: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject" | "full") => {
    setLoading(action);
    try {
      if (action === "approve") {
        await approveProfile(profileId, currentStatus);
      } else if (action === "reject") {
        await rejectProfile(profileId, currentStatus);
      } else if (action === "full") {
        await fullVerifyProfile(profileId, currentStatus);
      }
      window.location.reload();
    } catch (error) {
      alert("Error updating status: " + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus !== "basic" && currentStatus !== "full" && (
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
          onClick={() => handleAction("approve")}
          disabled={!!loading}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {loading === "approve" ? "..." : "Approve"}
        </Button>
      )}
      
      {currentStatus !== "full" && (
        <Button
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={() => handleAction("full")}
          disabled={!!loading}
        >
          <Shield className="w-4 h-4 mr-1" />
          {loading === "full" ? "..." : "Full Verify"}
        </Button>
      )}
      
      {currentStatus !== "rejected" && (
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
      )}
    </div>
  );
}