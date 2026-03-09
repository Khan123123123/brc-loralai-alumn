import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccessLabel } from "@/lib/utils/access";
import { DeleteAccountButton } from "@/components/DeleteAccountButton"; 
import {
  Award, Briefcase, Building, Edit, Globe, GraduationCap,
  Linkedin, Lock, Mail, MapPin, Phone, ShieldCheck, UserCircle2, AlertTriangle, Eye
} from "lucide-react";

export default async function MyProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/profile/complete");

  const accessLabel = getAccessLabel(profile);
  const isVerified = profile.admin_status === "approved" || profile.verification_status === "full" || profile.access_level === "full";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* BEAUTIFUL UPENN HEADER */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between z-10">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-3xl font-extrabold text-white shadow-inner border border-white/10 overflow-hidden">
               {profile.profile_photo_url ? (
                 <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
               ) : (
                 profile.full_name?.charAt(0)?.toUpperCase() || "A"
               )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex flex-wrap items-center gap-3">
                {profile.full_name || "My Profile"}
                {isVerified ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 text-sm py-1 shadow-sm"><ShieldCheck className="w-4 h-4 mr-1"/> Verified</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border border-amber-400/30 text-sm py-1"><Lock className="w-4 h-4 mr-1"/> Unverified</Badge>
                )}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                  Access: {accessLabel}
                </Badge>
                {profile.graduation_year && (
                  <Badge variant="outline" className="border-white/30 text-white bg-black/10">
                    Class of {profile.graduation_year}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/profile/complete"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary hover:scale-105 transition-transform shadow-lg"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Col */}
        <div className="space-y-6 lg:col-span-2">
          {/* About Card */}
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300 pt-6">
              {profile.bio ? (
                <p className="leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-slate-500 italic">No bio added yet.</p>
              )}

              {profile.achievements && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Award className="h-5 w-5 text-secondary" />
                    Milestones & Achievements
                  </h3>
                  <p className="leading-relaxed whitespace-pre-wrap">{profile.achievements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details Card */}
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2 pt-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Briefcase className="h-4 w-4 text-primary dark:text-blue-400" /> Profession
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.profession || "Not added"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Building className="h-4 w-4 text-primary dark:text-blue-400" /> Organization
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.current_organization || "Not added"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <UserCircle2 className="h-4 w-4 text-primary dark:text-blue-400" /> Current Position
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.current_position || "Not added"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Globe className="h-4 w-4 text-primary dark:text-blue-400" /> Industry
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.industry || "Not added"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Profile Views */}
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Profile Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700 dark:text-slate-300 pt-6">
              
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 font-medium flex items-center gap-3">
                 <Eye className="w-5 h-5" /> Your Profile, Email, and LinkedIn are visible to verified network members so they can connect with you. 
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Phone className="h-4 w-4 text-slate-400" /> Phone Visibility</div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">{(profile.show_phone || profile.show_phone_publicly) ? "Public to verified members" : "Hidden"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Award className="h-4 w-4 text-slate-400" /> Mentorship</div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">{profile.available_for_mentoring ? "Available for Mentoring" : "Not listed as mentor"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700 dark:text-slate-300 pt-6">
              <div className="flex items-center gap-3"><div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Mail className="h-4 w-4 text-primary dark:text-blue-400" /></div><span className="font-medium">{profile.email || user.email}</span></div>
              <div className="flex items-center gap-3"><div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Phone className="h-4 w-4 text-primary dark:text-blue-400" /></div><span className="font-medium">{profile.phone || profile.phone_number || "Not added"}</span></div>
              <div className="flex items-center gap-3"><div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><MapPin className="h-4 w-4 text-secondary" /></div><span className="font-medium">{profile.current_city || "Unknown city"}{profile.current_country ? `, ${profile.current_country}` : ""}</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Identity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300 pt-6">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3"><span className="font-medium text-slate-500">Entry year</span><span className="font-bold text-slate-900 dark:text-white">{profile.entry_year || "—"}</span></div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3"><span className="font-medium text-slate-500">Graduation year</span><span className="font-bold text-slate-900 dark:text-white">{profile.graduation_year || "—"}</span></div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3"><span className="font-medium text-slate-500">Home district</span><span className="font-bold text-slate-900 dark:text-white">{profile.home_district || "—"}</span></div>
              <div className="flex justify-between"><span className="font-medium text-slate-500">Student type</span><span className="font-bold text-slate-900 dark:text-white">{profile.student_type || "—"}</span></div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-md border border-red-100 bg-red-50/40">
            <CardHeader className="border-b border-red-100/50 pb-4">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5"/> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-red-700/80 leading-relaxed font-medium">
                Deleting your account will immediately remove all your data, credentials, and directory visibility. This action cannot be reversed.
              </p>
              <DeleteAccountButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}