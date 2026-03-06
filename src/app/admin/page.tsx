import { createClient } from "@/lib/supabase/server";
import { AdminApprovalActions } from "@/components/admin/AdminApprovalActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

export default async function AdminPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user?.email !== "qaisrani12116@gmail.com") {
    redirect("/directory");
  }

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("verification_status");

  const stats = {
    total: allProfiles?.length || 0,
    pending: allProfiles?.filter((p) => p.verification_status === "pending").length || 0,
    basic: allProfiles?.filter((p) => p.verification_status === "basic").length || 0,
    full: allProfiles?.filter((p) => p.verification_status === "full").length || 0,
    rejected: allProfiles?.filter((p) => p.verification_status === "rejected").length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Basic</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.basic}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.full}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingProfiles?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingProfiles || pendingProfiles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                        <Badge variant="outline">{profile.program}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Class of {profile.graduation_year} • {profile.profession || "No profession listed"}
                      </p>
                      {profile.current_city && (
                        <p className="text-sm text-gray-500">{profile.current_city}</p>
                      )}
                      {profile.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{profile.bio}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Applied: {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <AdminApprovalActions
                      profileId={profile.id}
                      currentStatus={profile.verification_status}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}