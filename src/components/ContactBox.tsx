"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

export function ContactBox({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    
    const { error } = await supabase.from("contact_messages").insert({
      sender_email: userEmail,
      subject,
      message
    });

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setSubject("");
      setMessage("");
    }
  };

  if (status === "success") {
    return (
      <div className="mb-12 rounded-3xl bg-emerald-50 border border-emerald-200 p-8 flex flex-col items-center justify-center text-emerald-800 text-center shadow-sm animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500" />
        <strong className="font-extrabold text-xl">Message Sent Successfully!</strong>
        <p className="text-sm mt-2 max-w-md">The administration team has received your message and will review it shortly.</p>
        <Button variant="outline" className="mt-6 rounded-full border-emerald-300 hover:bg-emerald-100 font-bold" onClick={() => { setIsOpen(false); setStatus("idle"); }}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-12 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-inner transition-all duration-300">
      {!isOpen ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
           <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full shrink-0">
                <MessageSquare className="text-primary w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xl">Contact Administration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">Report a fake profile, suggest a feature, or send a general inquiry directly to the team.</p>
              </div>
           </div>
           <Button onClick={() => setIsOpen(true)} className="rounded-full px-8 py-6 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-blue-900 text-white font-bold text-base shadow-md hover:scale-105 transition-transform shrink-0">
             Open Contact Form
           </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5 mb-2">
             <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-primary" /> Send a Message
             </h3>
             <Button type="button" variant="ghost" className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 font-bold" onClick={() => setIsOpen(false)}>Cancel</Button>
           </div>
           
           <div className="grid gap-5 md:grid-cols-2">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Email</label>
               <input type="text" disabled value={userEmail} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject / Reason</label>
               <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary shadow-sm cursor-pointer" required>
                 <option value="">Select a reason...</option>
                 <option value="Report Fake Profile">Report Fake Profile</option>
                 <option value="Update Data Request">Request Data Update</option>
                 <option value="App Feedback / Suggestion">App Feedback / Suggestion</option>
                 <option value="General Inquiry">General Inquiry</option>
               </select>
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message</label>
             <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="rounded-xl bg-white dark:bg-slate-950 resize-none border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary shadow-sm text-base p-4" placeholder="Provide details here... If reporting a profile, please include their exact name." />
           </div>
           
           <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
             {status === "error" ? <p className="text-red-500 text-sm font-bold">Failed to send message. Please try again.</p> : <div></div>}
             <Button type="submit" disabled={status === "loading" || !subject || !message} className="w-full sm:w-auto rounded-full px-10 py-6 bg-primary hover:bg-blue-900 text-white font-bold text-base shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
               {status === "loading" ? "Sending..." : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
             </Button>
           </div>
        </form>
      )}
    </div>
  );
}
