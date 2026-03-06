"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { fetchProfile(); }, []);
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/auth/login"); };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b p-4">
          <div className="container mx-auto flex justify-between">
            <Link href="/" className="font-bold text-xl text-blue-600">BRC Loralai Alumni</Link>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </header>
        <main className="container mx-auto p-4 max-w-2xl">
          <Card className="text-center p-8">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6">Complete your profile to join the network.</p>
            <Link href="/profile/complete"><Button className="bg-blue-600">Complete Profile</Button></Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-blue-600">BRC Loralai Alumni</Link>
          <div className="flex gap-4">
            {profile.verification_status !== 'pending' && <Link href="/directory"><Button variant="ghost">Directory</Button></Link>}
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-3xl">
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle>My Profile</CardTitle>
              <Badge className={profile.verification_status === 'full' ? 'bg-green-100 text-green-800' : profile.verification_status === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                {profile.verification_status === 'full' ? '✓ Fully Verified' : profile.verification_status === 'basic' ? '✓ Basic Access' : '⏳ Pending Verification'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {profile.verification_status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-800">Verification Pending</p>
                <p className="text-yellow-700">Score: {profile.verification_score}/100. {profile.verification_score < 50 && "Add verification answers to speed up approval."}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><h3 className="font-semibold text-gray-500 text-sm">Full Name</h3><p className="text-lg">{profile.full_name}</p></div>
              <div><h3 className="font-semibold text-gray-500 text-sm">Email</h3><p>{profile.email}</p></div>
              <div><h3 className="font-semibold text-gray-500 text-sm">Program</h3><p>{profile.program}</p></div>
              <div><h3 className="font-semibold text-gray-500 text-sm">Graduation Year</h3><p>{profile.graduation_year}</p></div>
              {profile.education_level && <div><h3 className="font-semibold text-gray-500 text-sm">Highest Education</h3><p>{profile.education_level}</p></div>}
              {profile.profession && <div><h3 className="font-semibold text-gray-500 text-sm">Profession</h3><p>{profile.profession}</p></div>}
              {profile.current_position && <div><h3 className="font-semibold text-gray-500 text-sm">Current Position</h3><p>{profile.current_position}</p></div>}
              {profile.current_city && <div><h3 className="font-semibold text-gray-500 text-sm">Location</h3><p>{profile.current_city}, {profile.current_country}</p></div>}
              {profile.phone && <div><h3 className="font-semibold text-gray-500 text-sm">Phone</h3><p>{profile.phone}</p></div>}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Link href="/profile/complete" className="flex-1"><Button variant="outline" className="w-full">Edit Profile</Button></Link>
              {profile.verification_status !== 'pending' && <Link href="/directory" className="flex-1"><Button className="w-full bg-blue-600">View Directory</Button></Link>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
