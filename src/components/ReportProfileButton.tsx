"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare } from "lucide-react";

export function ReportProfileButton({ memberName, memberId }: { memberName: string, memberId: string }) {
  const handleReport = () => {
    window.dispatchEvent(
      new CustomEvent("open-contact-form", {
        detail: {
          subject: "Report Fake Profile",
          message: `I am contacting admin regarding the profile of ${memberName} (Profile ID: ${memberId}). \n\nReason for report/message:\n`,
        },
      })
    );
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleReport}
      className="gap-2 font-bold text-slate-700 hover:bg-slate-100 rounded-xl bg-white border-slate-200 shadow-sm"
    >
      <AlertTriangle className="w-4 h-4 text-amber-500" />
      Report / Message Admin about Profile
    </Button>
  );
}