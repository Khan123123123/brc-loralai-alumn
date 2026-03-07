import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccessLabel } from "@/lib/utils/access";
import {
  Award,
  Briefcase,
  Building,
  Edit,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

export default async function MyProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile/complete");
  }

  const accessLabel = getAccessLabel(profile);
  
  // Clean verification check
  const isVerified = profile.admin_status === "approved" || profile.verification_status === "full" || profile.access_level === "full";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* BEAUTIFUL UPENN HEADER */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between z-10">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-3xl font-extrabold text-white shadow-inner border border-white/10">
              {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex flex-wrap items-center gap-3">
                {profile.full_name || "My Profile"}
                {/* VERIFIED/UNVERIFIED BADGE NEXT TO NAME */}
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

        <p className="mt-6 max-w-2xl text-white/90 text-sm leading-relaxed relative z-10">
          This is your personal dashboard. View your active profile details, private contact settings, and current directory visibility.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
                    Achievements
                  </h3>
                  <p className="leading-relaxed whitespace-pre-wrap">{profile.achievements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2 pt-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Briefcase className="h-4 w-4 text-primary dark:text-blue-400" />
                  Profession
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.profession || "Not added"}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Building className="h-4 w-4 text-primary dark:text-blue-400" />
                  Organization
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {profile.current_organization || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <UserCircle2 className="h-4 w-4 text-primary dark:text-blue-400" />
                  Current Position
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {profile.current_position || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Globe className="h-4 w-4 text-primary dark:text-blue-400" />
                  Industry
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{profile.industry || "Not added"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Directory & Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700 dark:text-slate-300 pt-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  {profile.show_in_directory ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                  Directory Visibility
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {profile.show_in_directory
                    ? "Your profile is visible in the alumni directory."
                    : "Your profile is hidden from the alumni directory."}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Phone className="h-4 w-4 text-slate-400" />
                    Phone
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                    {profile.show_phone_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                    {profile.show_email_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Linkedin className="h-4 w-4 text-slate-400" />
                    LinkedIn
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                    {profile.show_linkedin_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 p-4 text-xs font-medium">
                Contact fields only appear to others when you explicitly allow them. Verification answers and internal admin data are permanently hidden from the public directory.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700 dark:text-slate-300 pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Mail className="h-4 w-4 text-primary dark:text-blue-400" /></div>
                <span className="font-medium">{profile.email || user.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Phone className="h-4 w-4 text-primary dark:text-blue-400" /></div>
                <span className="font-medium">{profile.phone || "Not added"}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><MapPin className="h-4 w-4 text-secondary" /></div>
                <span className="font-medium">
                  {profile.current_city || "Unknown city"}
                  {profile.current_country ? `, ${profile.current_country}` : ""}
                </span>
              </div>

              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 font-bold text-primary dark:text-blue-400 hover:text-secondary transition-colors"
                >
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded-full"><Linkedin className="h-4 w-4" /></div>
                  <span>View LinkedIn Profile</span>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Linkedin className="h-4 w-4" /></div>
                  <span className="italic text-xs">No LinkedIn added</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Identity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300 pt-6">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3">
                <span className="font-medium text-slate-500 dark:text-slate-400">Entry year</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.entry_year || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3">
                <span className="font-medium text-slate-500 dark:text-slate-400">Graduation year</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.graduation_year || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-3">
                <span className="font-medium text-slate-500 dark:text-slate-400">Home district</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.home_district || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Student type</span>
                <span className="font-bold text-slate-900 dark:text-white">{profile.student_type || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Status & Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300 pt-6">
              
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.available_for_mentoring && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-blue-900/30 dark:text-blue-300">Available for mentoring</Badge>
                )}
                {profile.featured_in_presentation && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 dark:bg-red-900/30 dark:text-red-300">Featured Alumnus</Badge>
                )}
              </div>

              {Array.isArray(profile.languages) && profile.languages.length > 0 && (
                <div className="pt-2">
                  <div className="mb-2 font-bold text-slate-900 dark:text-white">Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language: string) => (
                      <Badge key={language} variant="outline" className="border-slate-200 dark:border-slate-700">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}