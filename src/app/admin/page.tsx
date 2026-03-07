import { createClient } from "@/lib/supabase/server";
import { AdminApprovalActions } from "@/components/admin/AdminApprovalActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Users, ShieldAlert, CheckCircle, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

  // Fetch all profiles to allow continuous management
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
            <p className="text-slate-500 mt-1">Manage network access, verify identities, and control user statuses.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Members</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-primary">{stats.total}</div></CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm border-b-4 border-yellow-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Pending Review</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm border-b-4 border-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Approved (Full)</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-emerald-600">{stats.full}</div></CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm border-b-4 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">{stats.rejected}</div></CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-white rounded-t-xl pb-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle className="text-xl flex items-center gap-2">User Management</CardTitle>
              <form className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  name="search" 
                  defaultValue={searchQuery}
                  placeholder="Search by name, email, or profession..." 
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </form>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Alumni Member</th>
                    <th className="px-6 py-4 font-semibold">Verification Score</th>
                    <th className="px-6 py-4 font-semibold">Current Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!allProfiles || allProfiles.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-500">No members found</td></tr>
                  ) : (
                    allProfiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{profile.full_name || "Unnamed User"}</span>
                            <span className="text-xs text-slate-500">{profile.email}</span>
                            <span className="text-xs text-slate-400 mt-1">Class of {profile.graduation_year || "N/A"} • {profile.profession || "No Profession"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${profile.verification_score >= 70 ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                                style={{ width: `${Math.min(profile.verification_score || 0, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-700">{profile.verification_score || 0}/100</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(profile.verification_status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <AdminApprovalActions
                              profileId={profile.id}
                              currentStatus={profile.verification_status || 'limited'}
                            />
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