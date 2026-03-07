import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAppearInDirectory, hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback, getVisibleContactFields } from "@/lib/utils/profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  GraduationCap,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldAlert,
  UserCircle2,
  Users,
} from "lucide-react";
import { Job, Education, VerificationAnswers } from "@/types/database";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default async function DirectoryMemberPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { redirect("/auth/login"); }

  const { data: viewerProfile } = await supabase.from("profiles").select("id, full_name, access_level, admin_status, verification_status, is_profile_complete").eq("id", user.id).single();
  const viewerHasFullAccess = hasFullAccess(viewerProfile);

  // Check if current user is Admin
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  const isAdmin = user.email?.toLowerCase() === adminEmail || user.email === "qaisrani12116@gmail.com";

  let query = supabase.from("profiles").select("*");
  if (isUUID(params.slug)) { query = query.or(`slug.eq.${params.slug},id.eq.${params.slug}`); } 
  else { query = query.eq("slug", params.slug); }

  const { data: member, error } = await query.single();
  if (error || !member) { notFound(); }
  if (!canAppearInDirectory(member)) { notFound(); }

  const visibleContacts = getVisibleContactFields(member, viewerProfile);
  const answers = member.verification_answers as VerificationAnswers | undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/directory" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">← Back to directory</Link>
      </div>

      <div className="mb-8 rounded-3xl bg-primary p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold text-white shadow-inner">
              {getAvatarFallback(member)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.graduation_year && <Badge variant="outline" className="border-white/20 text-white">Class of {member.graduation_year}</Badge>}
                {viewerHasFullAccess ? (
                  <Badge className="bg-white text-primary hover:bg-slate-100">Full Profile</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">Limited Profile</Badge>
                )}
              </div>
              {(member.current_position || member.profession) && (
                <p className="mt-4 text-slate-300 font-medium">{member.current_position || member.profession}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN ONLY VERIFICATION ANSWERS VIEW */}
      {isAdmin && answers && (
        <Card className="mb-8 rounded-3xl border-red-200 bg-red-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Admin Security View: Verification Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-red-900">
              <div className="bg-white/50 p-3 rounded-xl border border-red-100"><strong>House:</strong><br/> {answers.houses || "-"}</div>
              <div className="bg-white/50 p-3 rounded-xl border border-red-100"><strong>Teachers:</strong><br/> {answers.teachers || "-"}</div>
              <div className="bg-white/50 p-3 rounded-xl border border-red-100"><strong>Staff:</strong><br/> {answers.staff || "-"}</div>
              <div className="bg-white/50 p-3 rounded-xl border border-red-100"><strong>Principal:</strong><br/> {answers.principal || "-"}</div>
              <div className="bg-white/50 p-3 rounded-xl border border-red-100"><strong>Est. Year:</strong><br/> {answers.established_year || "-"}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {!viewerHasFullAccess && (
        <Card className="mb-8 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900"><Lock className="h-4 w-4" /> Limited Member View</div>
              <p className="text-sm text-amber-800">Complete verification to view contact info, job history, and full background.</p>
            </div>
            <Link href="/profile/complete" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Complete Verification</Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4"><CardTitle className="text-lg">About</CardTitle></CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-700">
              <div>
                {viewerHasFullAccess && member.bio ? (
                  <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">{member.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">{viewerHasFullAccess ? "No bio added yet." : "Detailed bio hidden (requires verification)."}</p>
                )}
              </div>
              {viewerHasFullAccess && member.achievements && (
                <div className="pt-4 border-t">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><Award className="h-5 w-5 text-secondary" /> Achievements</h3>
                  <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">{member.achievements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {viewerHasFullAccess && member.job_history && (member.job_history as Job[]).length > 0 && (
            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-slate-400" /> Job History</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(member.job_history as Job[]).map((job, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><Building className="w-5 h-5 text-slate-400"/></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{job.title}</h4>
                      <div className="text-sm text-slate-600">{job.company}</div>
                      <div className="text-xs text-slate-400 mt-1">{job.start_date} - {job.is_current ? "Present" : job.end_date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {viewerHasFullAccess && member.higher_education && (member.higher_education as Education[]).length > 0 && (
            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-slate-400" /> Higher Education</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(member.higher_education as Education[]).map((edu, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-slate-400"/></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{edu.institution}</h4>
                      <div className="text-sm text-slate-600">{edu.degree} in {edu.field}</div>
                      <div className="text-xs text-slate-400 mt-1">{edu.start_date} - {edu.end_date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Location</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-700">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"><MapPin className="h-5 w-5 text-primary" /></div>
                <span className="font-medium text-slate-900">{member.current_city || "Unknown city"}{member.current_country ? `, ${member.current_country}` : ""}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-md bg-white">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              {visibleContacts.email ? (
                <a href={`mailto:${visibleContacts.email}`} className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Mail className="h-5 w-5" /></div>
                  <span className="truncate font-medium text-slate-900">{visibleContacts.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Mail className="h-5 w-5" /></div>
                  <span className="text-xs text-slate-500">{viewerHasFullAccess ? "Hidden by user" : "Hidden (Requires Verification)"}</span>
                </div>
              )}

              {visibleContacts.phone ? (
                <a href={`tel:${visibleContacts.phone}`} className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Phone className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-900">{visibleContacts.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Phone className="h-5 w-5" /></div>
                  <span className="text-xs text-slate-500">{viewerHasFullAccess ? "Hidden by user" : "Hidden (Requires Verification)"}</span>
                </div>
              )}

              {visibleContacts.linkedin_url ? (
                <a href={visibleContacts.linkedin_url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Linkedin className="h-5 w-5" /></div>
                  <span className="font-medium text-slate-900">View LinkedIn</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Linkedin className="h-5 w-5" /></div>
                  <span className="text-xs text-slate-500">{viewerHasFullAccess ? "Hidden by user" : "Hidden (Requires Verification)"}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}