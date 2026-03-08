import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback, getVisibleContactFields } from "@/lib/utils/profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award, BookOpen, Briefcase, Building, GraduationCap, Linkedin,
  Lock, Mail, MapPin, Phone, ShieldCheck, ShieldAlert, Heart, MessageSquare, Globe, Home
} from "lucide-react";
import { Job, Education, VerificationAnswers } from "@/types/database";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default async function DirectoryMemberPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: viewerProfile } = await supabase.from("profiles").select("id, full_name, access_level, admin_status, verification_status, is_profile_complete").eq("id", user.id).single();
  const isVerified = hasFullAccess(viewerProfile);

  const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const userEmail = user?.email?.toLowerCase() || "";
  const isAdmin = userEmail && (userEmail === adminEnvEmail || userEmail === "qaisrani12116@gmail.com" || userEmail === "brcloralai123@gmail.com");

  let query = supabase.from("profiles").select("*");
  if (isUUID(params.slug)) query = query.or(`slug.eq.${params.slug},id.eq.${params.slug}`);
  else query = query.eq("slug", params.slug);

  const { data: member, error } = await query.single();
  if (error || !member) notFound();
  if (member.show_in_directory === false) notFound();

  const visibleContacts = getVisibleContactFields(member, viewerProfile);
  const answers = member.verification_answers as VerificationAnswers | undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/directory" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">← Back to directory</Link>
      </div>

      {/* HEADER CARD */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm text-3xl font-bold text-white shadow-inner border border-white/20">
              {getAvatarFallback(member)}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{member.full_name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.account_type === "Faculty" && <Badge variant="outline" className="border-white/30 bg-white/10 text-white"><BookOpen className="w-3 h-3 mr-1"/> Faculty</Badge>}
                {member.entry_year && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Entry {member.entry_year}</Badge>}
                {member.graduation_year && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Class of {member.graduation_year}</Badge>}
                {isVerified ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0"><ShieldCheck className="w-3 h-3 mr-1"/> Verified View</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/80 text-white hover:bg-amber-600 border-0"><Lock className="w-3 h-3 mr-1"/> Unverified Profile</Badge>
                )}
              </div>
              {isVerified && (member.current_position || member.profession) && (
                <p className="mt-4 text-white/90 text-lg font-medium">{member.current_position || member.profession} {member.current_organization && `at ${member.current_organization}`}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN SECURITY VIEW */}
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

      {/* UNVERIFIED BLOCKER */}
      {!isVerified && (
        <Card className="mb-8 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-8 items-center text-center">
            <div className="p-4 bg-amber-100 rounded-full text-amber-600 mb-2"><Lock className="h-8 w-8" /></div>
            <h2 className="font-extrabold text-amber-900 text-2xl">Profile Details Hidden</h2>
            <p className="text-amber-800 max-w-2xl leading-relaxed text-lg">Your account is currently Unverified. We protect the privacy of our alumni by restricting professional details, contact information, and life updates to verified members only.</p>
            <Link href="/profile/complete" className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-900 shadow-lg hover:scale-105 transition-all">Complete Your Profile to Request Verification</Link>
          </CardContent>
        </Card>
      )}

      {/* VERIFIED CONTENT GRID */}
      {isVerified && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* MAIN COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* ABOUT & MESSAGE */}
            <Card className="rounded-3xl border-0 shadow-md bg-white overflow-hidden">
              <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg">About & Legacy</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-8 text-sm text-slate-700">
                {member.bio && (
                  <div>
                    <p className="leading-relaxed text-slate-700 whitespace-pre-wrap text-base">{member.bio}</p>
                  </div>
                )}
                
                {member.message_for_koharians && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 relative">
                     <MessageSquare className="absolute top-4 right-4 w-8 h-8 text-blue-200 opacity-50" />
                     <h3 className="mb-2 font-bold text-blue-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Message for Koharians</h3>
                     <p className="leading-relaxed text-blue-800 italic font-medium whitespace-pre-wrap">"{member.message_for_koharians}"</p>
                  </div>
                )}

                {member.languages && member.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Globe className="w-5 h-5 text-slate-400 mr-1"/>
                    <span className="font-semibold text-slate-900 mr-2">Languages:</span>
                    {member.languages.map((lang: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">{lang}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ACHIEVEMENTS & MEMORIES */}
            {(member.achievements_brc || member.achievements_after || member.favorite_teacher) && (
               <Card className="rounded-3xl border-0 shadow-md bg-white overflow-hidden">
                 <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Milestones & Memories</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                    {member.favorite_teacher && (
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5"><Heart className="w-4 h-4 text-rose-500" /> Favorite BRC Teacher</h4>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{member.favorite_teacher}</p>
                      </div>
                    )}
                    {member.achievements_brc && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1.5">Achievements during BRC</h4>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{member.achievements_brc}</p>
                      </div>
                    )}
                    {member.achievements_after && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1.5">Achievements after BRC</h4>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{member.achievements_after}</p>
                      </div>
                    )}
                 </CardContent>
               </Card>
            )}

          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* LOCATION DETAILS */}
            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg">Location</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"><MapPin className="h-5 w-5 text-primary" /></div>
                  <div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current City</div>
                     <span className="font-bold text-slate-900">{member.current_city || "Unknown city"}{member.current_country ? `, ${member.current_country}` : ""}</span>
                  </div>
                </div>
                {(member.home_city || member.home_district) && (
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"><Home className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                       <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-0.5">Originally From</div>
                       <span className="font-bold text-emerald-900">{member.home_city ? `${member.home_city}` : ""}{member.home_district ? ` (District ${member.home_district})` : ""}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CONTACT CARD */}
            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {visibleContacts.email ? (
                  <a href={`mailto:${visibleContacts.email}`} className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Mail className="h-5 w-5" /></div>
                    <span className="truncate font-medium text-slate-900">{visibleContacts.email}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Mail className="h-5 w-5" /></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hidden by user</span>
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
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hidden by user</span>
                  </div>
                )}

                {visibleContacts.linkedin_url && (
                  <a href={visibleContacts.linkedin_url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Linkedin className="h-5 w-5" /></div>
                    <span className="font-medium text-slate-900">View LinkedIn</span>
                  </a>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}