"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminApprovalActions } from "@/components/admin/AdminApprovalActions"; // Corrected import path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, LogOut, MessageSquare, Megaphone, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toggleFeaturedStatus } from "./action";

export default function AdminPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = createClient();
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.search || "";

  useEffect(() => {
    const loadAdminData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
      const userEmail = user?.email?.toLowerCase() || "";
      const isAdmin = userEmail && (userEmail === adminEnvEmail || userEmail === "qaisrani12116@gmail.com" || userEmail === "brcloralai123@gmail.com");

      if (!isAdmin) {
        window.location.replace("/directory");
        return;
      }

      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      const { data: profilesData } = await query;
      setAllProfiles(profilesData || []);

      const { data: msgsData } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
        
      setMessages(msgsData || []);
      setLoading(false);
    };

    loadAdminData();
  }, [supabase, searchQuery]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.replace("/auth/login");
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter(m => m.id !== id));
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/announcements" className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white hover:bg-blue-900 rounded-xl text-sm font-bold shadow-sm">
              <Megaphone className="w-4 h-4" /> Manage Announcements
            </Link>
            <button onClick={handleSignOut} className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        <Card className="border-0 shadow-md mb-12">
          <CardHeader className="border-b bg-white rounded-t-xl pb-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl">User Dashboard</CardTitle>
              <form className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input name="search" defaultValue={searchQuery} placeholder="Search users..." className="pl-9 bg-slate-50"/>
              </form>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Alumni Details</th>
                    <th className="px-6 py-4 font-semibold">Security Answers</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 align-top w-1/4">
                        <div className="font-semibold text-slate-900 text-base flex items-center gap-2">
                           {profile.full_name || "Unnamed"}
                           {profile.featured_in_presentation && (
                             <span title="Featured Alumni">
                               <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                             </span>
                           )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{profile.email}</div>
                        <div className="text-xs text-slate-600 mt-2 mb-3">{profile.profession || "No Profession"}</div>
                        <Link href={`/directory/${profile.slug || profile.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <ExternalLink className="w-3 h-3" /> View Profile
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-top w-1/2">
                        <div className="bg-amber-50 rounded-lg p-3 text-xs border border-amber-100 text-slate-800 space-y-1">
                          <div><strong>House:</strong> {profile.verification_answers?.houses || "-"}</div>
                          <div><strong>Teachers:</strong> {profile.verification_answers?.teachers || "-"}</div>
                          <div><strong>Est. Year:</strong> {profile.verification_answers?.established_year || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right w-1/4">
                        <div className="flex flex-col items-end gap-3">
                          <AdminApprovalActions profileId={profile.id} currentStatus={profile.verification_status || 'pending'} />
                          <form action={toggleFeaturedStatus.bind(null, profile.id, profile.featured_in_presentation)}>
                             <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg border shadow-sm font-bold flex items-center gap-1.5 ${profile.featured_in_presentation ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <Star className={`w-3.5 h-3.5 ${profile.featured_in_presentation ? 'fill-amber-500 text-amber-500' : ''}`} /> 
                                {profile.featured_in_presentation ? "Unfeature" : "Feature Profile"}
                             </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}