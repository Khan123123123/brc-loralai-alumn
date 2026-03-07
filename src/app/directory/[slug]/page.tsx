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

// Helper function to check if the slug is a valid UUID
const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

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

  // FIXED QUERY: Only search by 'id' if the parameter is actually a UUID
  let query = supabase.from("profiles").select("*");
  
  if (isUUID(params.slug)) {
    query = query.or(`slug.eq.${params.slug},id.eq.${params.slug}`);
  } else {
    query = query.eq("slug", params.slug);
  }

  const { data: member, error } = await query.single();

  // If the user doesn't exist or an error occurs, show 404
  if (error || !member) {
    console.error("Error fetching member:", error);
    notFound();
  }

  // If they have hidden themselves from the directory, show 404
  if (!canAppearInDirectory(member)) {
    notFound();
  }

  const visibleContacts = getVisibleContactFields(member, viewerProfile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/directory"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to directory
        </Link>
      </div>

      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold text-white shadow-inner">
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
                  <Badge className="bg-white text-slate-900 hover:bg-slate-100">
                    Full profile view
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                    Limited profile view
                  </Badge>
                )}

                {viewerHasFullAccess && member.available_for_mentoring && (
                  <Badge className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-400/30">
                    Available for mentoring
                  </Badge>
                )}
              </div>

              {(member.current_position || member.profession) && (
                <p className="mt-4 text-slate-300 font-medium">
                  {member.current_position || member.profession}
                </p>
              )}
            </div>
          </div>

          {!viewerHasFullAccess && (
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200 max-w-xs border border-white/10 shadow-sm">
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
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Complete profile
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Profile overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-700">
              <div>
                {viewerHasFullAccess && member.bio ? (
                  <p className="leading-relaxed text-slate-600">{member.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    {viewerHasFullAccess
                      ? "No bio added yet."
                      : "Detailed bio is available to approved full-access members."}
                  </p>
                )}
              </div>

              {viewerHasFullAccess && member.achievements && (
                <div className="pt-4 border-t">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                    <Award className="h-5 w-5 text-blue-600" />
                    Achievements
                  </h3>
                  <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">{member.achievements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Professional details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  Profession
                </div>
                <div className="text-slate-600">{member.profession || "Not added"}</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  Current position
                </div>
                <div className="text-slate-600">
                  {member.current_position || "Not added"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                  <Building className="h-4 w-4 text-slate-400" />
                  Organization
                </div>
                <div className="text-slate-600">
                  {viewerHasFullAccess
                    ? member.current_organization || "Not added"
                    : "Visible to approved members"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                  <Users className="h-4 w-4 text-slate-400" />
                  Industry
                </div>
                <div className="text-slate-600">
                  {viewerHasFullAccess
                    ? member.industry || "Not added"
                    : "Visible to approved members"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">BRC details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="font-medium text-slate-900">Entry year</span>
                <span className="text-slate-600">{member.entry_year || "—"}</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="font-medium text-slate-900">Graduation year</span>
                <span className="text-slate-600">{member.graduation_year || "—"}</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="font-medium text-slate-900">Home district</span>
                <span className="text-slate-600">{member.home_district || "—"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium text-slate-900">Student type</span>
                <span className="text-slate-600">{member.student_type || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-slate-900">
                  {member.current_city || "Unknown city"}
                  {member.current_country ? `, ${member.current_country}` : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              {visibleContacts.email ? (
                <a
                  href={`mailto:${visibleContacts.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="truncate font-medium text-slate-900">{visibleContacts.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-500">
                    {viewerHasFullAccess ? "Email is hidden by user" : "Visible to approved members only"}
                  </span>
                </div>
              )}

              {visibleContacts.phone ? (
                <a
                  href={`tel:${visibleContacts.phone}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-900">{visibleContacts.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-500">
                    {viewerHasFullAccess ? "Phone is hidden by user" : "Visible to approved members only"}
                  </span>
                </div>
              )}

              {visibleContacts.linkedin_url ? (
                <a
                  href={visibleContacts.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-900">View LinkedIn Profile</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-500">
                    {viewerHasFullAccess ? "LinkedIn is hidden by user" : "Visible to approved members only"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {viewerHasFullAccess && member.available_for_mentoring && (
            <Card className="rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900">Mentorship</h4>
                    <p className="mt-1 text-sm text-emerald-800">
                      This alumni member has indicated they are open to mentoring and professional connections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}