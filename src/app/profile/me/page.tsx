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
  const adminStatus =
    profile.admin_status === "approved"
      ? "Approved"
      : profile.admin_status === "rejected"
      ? "Rejected"
      : "Pending review";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold text-white">
              {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {profile.full_name || "My Profile"}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-white text-slate-900 hover:bg-white">
                  {accessLabel}
                </Badge>
                <Badge variant="secondary">{adminStatus}</Badge>
                {profile.graduation_year && (
                  <Badge variant="outline" className="border-white/20 text-white">
                    Class of {profile.graduation_year}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/profile/complete"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            <Edit className="h-4 w-4" />
            Edit profile
          </Link>
        </div>

        <p className="mt-5 max-w-2xl text-slate-300">
          This is your personal member view. You can see all your profile fields, including private contact settings and visibility choices.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              {profile.bio ? (
                <p className="leading-7">{profile.bio}</p>
              ) : (
                <p className="text-slate-500">No bio added yet.</p>
              )}

              {profile.achievements && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                    <Award className="h-4 w-4" />
                    Achievements
                  </h3>
                  <p className="leading-7">{profile.achievements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Professional details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Briefcase className="h-4 w-4" />
                  Profession
                </div>
                <div className="text-slate-600">{profile.profession || "Not added"}</div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Building className="h-4 w-4" />
                  Organization
                </div>
                <div className="text-slate-600">
                  {profile.current_organization || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <UserCircle2 className="h-4 w-4" />
                  Current position
                </div>
                <div className="text-slate-600">
                  {profile.current_position || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Globe className="h-4 w-4" />
                  Industry
                </div>
                <div className="text-slate-600">{profile.industry || "Not added"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Directory and privacy settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  {profile.show_in_directory ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  Directory visibility
                </div>
                <div className="text-slate-600">
                  {profile.show_in_directory
                    ? "Your profile is visible in the alumni directory."
                    : "Your profile is hidden from the alumni directory."}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <div className="text-slate-600">
                    {profile.show_phone_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-slate-600">
                    {profile.show_email_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </div>
                  <div className="text-slate-600">
                    {profile.show_linkedin_publicly ? "Public to verified members" : "Hidden"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                Contact fields only appear to others when you explicitly allow them. Verification answers and admin data always stay private.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Contact and location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>{profile.email || user.email}</span>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>{profile.phone || "Not added"}</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  {profile.current_city || "Unknown city"}
                  {profile.current_country ? `, ${profile.current_country}` : ""}
                </span>
              </div>

              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
                >
                  <Linkedin className="h-4 w-4" />
                  Open LinkedIn
                </a>
              ) : (
                <div className="flex items-start gap-3 text-slate-500">
                  <Linkedin className="mt-0.5 h-4 w-4" />
                  <span>No LinkedIn added</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>BRC details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div>
                <div className="font-medium text-slate-900">Entry year</div>
                <div className="text-slate-600">{profile.entry_year || "Not added"}</div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Graduation year</div>
                <div className="text-slate-600">{profile.graduation_year || "Not added"}</div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Home district</div>
                <div className="text-slate-600">{profile.home_district || "Not added"}</div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Student type</div>
                <div className="text-slate-600">{profile.student_type || "Not added"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Status and extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>Access level: {accessLabel}</span>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>Admin review: {adminStatus}</span>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  Profile completion: {profile.is_profile_complete ? "Complete" : "Incomplete"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.available_for_mentoring && (
                  <Badge variant="secondary">Available for mentoring</Badge>
                )}
                {profile.featured_in_presentation && (
                  <Badge variant="secondary">Featured in presentations</Badge>
                )}
              </div>

              {Array.isArray(profile.languages) && profile.languages.length > 0 && (
                <div>
                  <div className="mb-2 font-medium text-slate-900">Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language: string) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Private internal note</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Your verification answers and internal review details are intentionally hidden from public profile views.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}