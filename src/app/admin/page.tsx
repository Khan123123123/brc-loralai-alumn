"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminApprovalActions } from "@/components/admin/AdminApprovalActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Search, ExternalLink, LogOut, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AdminPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = createClient();
  const router = useRouter();
  
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

      // ADMIN ACCESS CHECK
      if (!isAdmin) {
        window.location.replace("/directory");
        return;
      }

      // FETCH PROFILES
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,profession.ilike.%${searchQuery}%`);
      }
      const { data: profilesData } = await query;
      setAllProfiles(profilesData || []);

      // FETCH INBOX MESSAGES
      const { data: msgsData } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
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
    if (!confirm("Are you sure you want to delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter(m => m.id !== id));
  };

  const stats = {
    total: allProfiles.length || 0,
    unverified: allProfiles.filter((p) => p.verification_status !== "full").length || 0,
    verified: allProfiles.filter((p) => p.verification_status === "full").length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Unverified</Badge>;
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl text-sm font-bold shadow-sm transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Total Users</span><span className="text-2xl font-bold text-primary">{stats.total}</span></CardContent></Card>
          <Card className="border-0 shadow-sm border-b-4 border-amber-400"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Unverified</span><span className="text-2xl font-bold text-amber-600">{stats.unverified}</span></CardContent></Card>
          <Card className="border-0 shadow-sm border-b-4 border-emerald-500"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Verified</span><span className="text-2xl font-bold text-emerald-600">{stats.verified}</span></CardContent></Card>
        </div>

        {/* USER VERIFICATION TABLE */}
        <Card className="border-0 shadow-md mb-12">
          <CardHeader className="border-b bg-white rounded-t-xl pb-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl">User Verification Dashboard</CardTitle>
              <form className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input name="search" defaultValue={searchQuery} placeholder="Search names, emails, professions..." className="pl-9 bg-slate-50 border-slate-200"/>
              </form>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Alumni Details</th>
                    <th className="px-6 py-4 font-semibold">Security Answers (Admin Only)</th>
                    <th className="px-6 py-4 font-semibold text-right">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allProfiles.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500">No members found</td></tr>
                  ) : (
                    allProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 align-top w-1/4">
                          <div className="font-semibold text-slate-900 text-base">{profile.full_name || "Unnamed User"}</div>
                          <div className="text-xs text-slate-500 mt-1">{profile.email}</div>
                          <div className="text-xs text-primary font-medium mt-2">Class of {profile.graduation_year || "N/A"}</div>
                          <div className="text-xs text-slate-600 mt-1 mb-3">{profile.profession || "No Profession"}</div>
                          <Link href={`/directory/${profile.slug || profile.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded">
                            <ExternalLink className="w-3 h-3" /> View Profile
                          </Link>
                        </td>
                        <td className="px-6 py-4 align-top w-1/2">
                          <div className="bg-amber-50 rounded-lg p-3 text-xs border border-amber-100 text-slate-800 space-y-2">
                            <div className="flex gap-2"><strong className="w-20 shrink-0 text-amber-900">House:</strong> <span className="font-medium">{profile.verification_answers?.houses || "-"}</span></div>
                            <div className="flex gap-2"><strong className="w-20 shrink-0 text-amber-900">Teachers:</strong> <span className="font-medium">{profile.verification_answers?.teachers || "-"}</span></div>
                            <div className="flex gap-2"><strong className="w-20 shrink-0 text-amber-900">Staff/Guards:</strong> <span className="font-medium">{profile.verification_answers?.staff || "-"}</span></div>
                            <div className="flex gap-2"><strong className="w-20 shrink-0 text-amber-900">Principal:</strong> <span className="font-medium">{profile.verification_answers?.principal || "-"}</span></div>
                            <div className="flex gap-2"><strong className="w-20 shrink-0 text-amber-900">Est. Year:</strong> <span className="font-medium">{profile.verification_answers?.established_year || "-"}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top text-right w-1/4">
                          <div className="flex flex-col items-end gap-3">
                            {getStatusBadge(profile.verification_status)}
                            <AdminApprovalActions profileId={profile.id} currentStatus={profile.verification_status || 'pending'} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ADMIN INBOX FOR CONTACT REPORTS */}
        <Card className="border-0 shadow-md mb-12">
          <CardHeader className="border-b bg-white rounded-t-xl pb-4">
             <CardTitle className="text-xl flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary"/> User Messages & Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date & Sender</th>
                    <th className="px-6 py-4 font-semibold">Subject & Message</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {messages.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-10 text-slate-500 font-medium">Your inbox is empty</td></tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 align-top w-1/4">
                          <div className="font-bold text-slate-900">{new Date(msg.created_at).toLocaleDateString()}</div>
                          <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">{msg.sender_email}</div>
                        </td>
                        <td className="px-6 py-4 align-top w-1/2">
                          <div className="font-bold text-slate-800 mb-1.5">{msg.subject}</div>
                          <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 hover:border-red-200 shadow-sm">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}