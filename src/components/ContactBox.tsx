"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, CheckCircle2, X } from "lucide-react";

export function ContactBox({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.subject) setSubject(e.detail.subject);
      if (e.detail?.message) setMessage(e.detail.message);
    };
    window.addEventListener("open-contact-form", handleOpen);
    return () => window.removeEventListener("open-contact-form", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({ sender_email: userEmail, subject, message });
    if (error) setStatus("error");
    else { setStatus("success"); setSubject(""); setMessage(""); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
        <Card className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden bg-white">
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <h3 className="font-black text-xl flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> Support & Reporting
            </h3>
            <button onClick={() => {setIsOpen(false); setStatus("idle");}} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <CardContent className="p-8">
            {status === "success" ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                <h4 className="text-2xl font-bold text-slate-900">Message Sent</h4>
                <p className="text-slate-500 mt-2">Admin team has received your report.</p>
                <Button onClick={() => setIsOpen(false)} className="mt-8 rounded-full px-10 font-bold bg-primary">Close Window</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:ring-primary" required>
                    <option value="">Select reason...</option>
                    <option value="Report Fake Profile">Report Fake Profile</option>
                    <option value="App Suggestion">Suggestion / Feedback</option>
                    <option value="General Inquiry">General Question</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Message</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="rounded-2xl border-slate-200 bg-slate-50 p-4 text-base focus:ring-primary" placeholder="Details..." />
                </div>
                <Button type="submit" disabled={status === "loading"} className="w-full h-14 rounded-2xl text-base font-black bg-primary text-white shadow-lg hover:bg-blue-900">
                  {status === "loading" ? "Sending..." : "Submit Message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}