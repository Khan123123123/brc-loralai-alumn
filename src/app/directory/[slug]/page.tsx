import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAppearInDirectory, hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback, getVisibleContactFields } from "@/lib/utils/profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  Briefcase,
  Building,
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

export default async function DirectoryMemberPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("id, full_name, access_level, admin_status, verification_status, is_profile_complete")
    .eq("id", user.id)
    .single();

  const viewerHasFullAccess = hasFullAccess(viewerProfile);

  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .single();

  if (!member) {
    notFound();
  }

  if (!canAppearInDirectory(member)) {
    notFound();
  }

  const visibleContacts = getVisibleContactFields(member, viewerProfile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/directory"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to directory
        </Link>
      </div>

      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold text-white">
              {getAvatarFallback(member)}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {member.full_name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                {member.graduation_year && (
                  <Badge variant="outline" className="border-white/20 text-white">
                    Class of {member.graduation_year}
                  </Badge>
                )}

                {viewerHasFullAccess ? (
                  <Badge className="bg-white text-slate-900 hover:bg-white">
                    Full profile view
                  </Badge>
                ) : (
                  <Badge variant="secondary">Limited profile view</Badge>
                )}

                {viewerHasFullAccess && member.available_for_mentoring && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Available for mentoring
                  </Badge>
                )}
              </div>

              {(member.current_position || member.profession) && (
                <p className="mt-4 text-slate-300">
                  {member.current_position || member.profession}
                </p>
              )}
            </div>
          </div>

          {!viewerHasFullAccess && (
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">
              Complete your profile and get approved to unlock full alumni details.
            </div>
          )}
        </div>
      </div>

      {!viewerHasFullAccess && (
        <Card className="mb-8 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                <Lock className="h-4 w-4" />
                Limited member preview
              </div>
              <p className="text-sm text-amber-800">
                You can currently see safe alumni details only. Complete your profile and receive approval to view full member profiles and public contact fields.
              </p>
            </div>

            <Link
              href="/profile/complete"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Complete profile
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Profile overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              {viewerHasFullAccess && member.bio ? (
                <p className="leading-7">{member.bio}</p>
              ) : (
                <p className="text-slate-500">
                  {viewerHasFullAccess
                    ? "No bio added yet."
                    : "Detailed bio is available to approved full-access members."}
                </p>
              )}

              {viewerHasFullAccess && member.achievements && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                    <Award className="h-4 w-4" />
                    Achievements
                  </h3>
                  <p className="leading-7">{member.achievements}</p>
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
                <div className="text-slate-600">{member.profession || "Not added"}</div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <UserCircle2 className="h-4 w-4" />
                  Current position
                </div>
                <div className="text-slate-600">
                  {member.current_position || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Building className="h-4 w-4" />
                  Organization
                </div>
                <div className="text-slate-600">
                  {viewerHasFullAccess
                    ? member.current_organization || "Not added"
                    : "Visible to approved full-access members"}
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Users className="h-4 w-4" />
                  Industry
                </div>
                <div className="text-slate-600">
                  {viewerHasFullAccess
                    ? member.industry || "Not added"
                    : "Visible to approved full-access members"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>BRC details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div>
                <div className="font-medium text-slate-900">Entry year</div>
                <div className="text-slate-600">{member.entry_year || "Not added"}</div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Graduation year</div>
                <div className="text-slate-600">
                  {member.graduation_year || "Not added"}
                </div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Home district</div>
                <div className="text-slate-600">
                  {member.home_district || "Not added"}
                </div>
              </div>

              <div>
                <div className="font-medium text-slate-900">Student type</div>
                <div className="text-slate-600">
                  {member.student_type || "Not added"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <span>
                  {member.current_city || "Unknown city"}
                  {member.current_country ? `, ${member.current_country}` : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              {visibleContacts.email ? (
                <a
                  href={`mailto:${visibleContacts.email}`}
                  className="flex items-start gap-3 hover:text-slate-900"
                >
                  <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>{visibleContacts.email}</span>
                </a>
              ) : (
                <div className="flex items-start gap-3 text-slate-500">
                  <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>
                    {viewerHasFullAccess
                      ? "Email is private"
                      : "Email visibility is available to approved full-access members only"}
                  </span>
                </div>
              )}

              {visibleContacts.phone ? (
                <a
                  href={`tel:${visibleContacts.phone}`}
                  className="flex items-start gap-3 hover:text-slate-900"
                >
                  <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>{visibleContacts.phone}</span>
                </a>
              ) : (
                <div className="flex items-start gap-3 text-slate-500">
                  <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>
                    {viewerHasFullAccess
                      ? "Phone number is private"
                      : "Phone visibility is available to approved full-access members only"}
                  </span>
                </div>
              )}

              {visibleContacts.linkedin_url ? (
                <a
                  href={visibleContacts.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 hover:text-slate-900"
                >
                  <Linkedin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>Open LinkedIn</span>
                </a>
              ) : (
                <div className="flex items-start gap-3 text-slate-500">
                  <Linkedin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>
                    {viewerHasFullAccess
                      ? "LinkedIn is private"
                      : "LinkedIn visibility is available to approved full-access members only"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {viewerHasFullAccess && member.available_for_mentoring && (
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Mentorship</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>This alumni member is open to mentoring connections.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}