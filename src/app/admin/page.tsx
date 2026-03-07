import { createClient } from "@/lib/supabase/server";
import { AdminApprovalActions } from "@/components/admin/AdminApprovalActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Users, ShieldAlert, CheckCircle, XCircle, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  
  if (user?.email?.toLowerCase() !== adminEmail && user?.email !== "qaisrani12116@gmail.com") {
    redirect("/directory");
  }

  const searchQuery = searchParams.search || "";

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,profession.ilike.%${searchQuery}%`);
  }

  const { data: allProfiles } = await query;

  const stats = {
    total: allProfiles?.length || 0,
    pending: allProfiles?.filter((p) => p.verification_status === "pending").length || 0,
    full: allProfiles?.filter((p) => p.verification_status === "full").length || 0,
    rejected: allProfiles?.filter((p) => p.verification_status === "rejected").length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Full Access</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-slate-600">Limited</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Admin Control Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Total Users</span><span className="text-2xl font-bold text-primary">{stats.total}</span></CardContent></Card>
          <Card className="border-0 shadow-sm border-b-4 border-yellow-400"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Pending</span><span className="text-2xl font-bold text-yellow-600">{stats.pending}</span></CardContent></Card>
          <Card className="border-0 shadow-sm border-b-4 border-emerald-500"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Approved</span><span className="text-2xl font-bold text-emerald-600">{stats.full}</span></CardContent></Card>
          <Card className="border-0 shadow-sm border-b-4 border-red-500"><CardContent className="p-4 flex justify-between items-center"><span className="text-slate-600 font-semibold">Rejected</span><span className="text-2xl font-bold text-red-600">{stats.rejected}</span></CardContent></Card>
        </div>

        <Card className="border-0 shadow-md">
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
                  {!allProfiles || allProfiles.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500">No members found</td></tr>
                  ) : (
                    allProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 align-top w-1/4">
                          <div className="font-semibold text-slate-900 text-base">{profile.full_name || "Unnamed User"}</div>
                          <div className="text-xs text-slate-500 mt-1">{profile.email}</div>
                          <div className="text-xs text-primary font-medium mt-2">Class of {profile.graduation_year || "N/A"}</div>
                          <div className="text-xs text-slate-600 mt-1 mb-3">{profile.profession || "No Profession"}</div>
                          
                          <Link 
                            href={`/directory/${profile.slug || profile.id}`} 
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
                          >
                            <ExternalLink className="w-3 h-3" /> View Full Profile
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
                            <AdminApprovalActions profileId={profile.id} currentStatus={profile.verification_status || 'limited'} />
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
      </div>
    </div>
  );
}