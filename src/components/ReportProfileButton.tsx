"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ReportProfileButton({ memberName, memberId }: { memberName: string, memberId: string }) {
  const handleReport = () => {
    window.dispatchEvent(
      new CustomEvent("open-contact-form", {
        detail: {
          subject: "Report Fake Profile",
          message: `I am reporting the profile of ${memberName} (Profile ID: ${memberId}). \n\nReason for report:\n`,
        },
      })
    );
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleReport}
      className="gap-2 font-bold rounded-xl mt-4 w-full sm:w-auto shadow-sm"
    >
      <AlertTriangle className="w-4 h-4" />
      Report Profile to Admin
    </Button>
  );
}