import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  GraduationCap,
  User,
  Linkedin,
  Award,
  Languages,
  Edit,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-2xl font-bold text-white">
            {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {profile.full_name || "My Profile"}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="capitalize">
                {profile.verification_status || "incomplete"}
              </Badge>
              {profile.graduation_year && (
                <Badge variant="secondary">Class of {profile.graduation_year}</Badge>
              )}
              {profile.student_type && (
                <Badge variant="outline">{profile.student_type}</Badge>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/profile/complete"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl shadow-sm">
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

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Briefcase className="h-4 w-4" />
                  Profession
                </div>
                <div className="text-slate-600">{profile.profession || "Not added"}</div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Building className="h-4 w-4" />
                  Organization
                </div>
                <div className="text-slate-600">
                  {profile.current_organization || "Not added"}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <User className="h-4 w-4" />
                  Position
                </div>
                <div className="text-slate-600">
                  {profile.current_position || "Not added"}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <GraduationCap className="h-4 w-4" />
                  Industry
                </div>
                <div className="text-slate-600">{profile.industry || "Not added"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
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

              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
                >
                  <Linkedin className="h-4 w-4" />
                  Open LinkedIn
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>BRC Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div>
                <div className="font-medium text-slate-900">Entry Year</div>
                <div className="text-slate-600">{profile.entry_year || "Not added"}</div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Graduation Year</div>
                <div className="text-slate-600">
                  {profile.graduation_year || "Not added"}
                </div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Home District</div>
                <div className="text-slate-600">
                  {profile.home_district || "Not added"}
                </div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Student Type</div>
                <div className="text-slate-600">
                  {profile.student_type || "Not added"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <Languages className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  {Array.isArray(profile.languages) && profile.languages.length > 0
                    ? profile.languages.join(", ")
                    : "No languages added"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.available_for_mentoring && (
                  <Badge variant="secondary">Available for mentoring</Badge>
                )}
                {profile.featured_in_presentation && (
                  <Badge variant="secondary">Featured in presentation</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}