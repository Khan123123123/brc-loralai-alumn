import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback, getVisibleContactFields } from "@/lib/utils/profile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award, BookOpen, Briefcase, Building, GraduationCap, Linkedin, Phone,
  Lock, Mail, MapPin, ShieldCheck, ShieldAlert, Heart, MessageSquare, Globe, Home, Star
} from "lucide-react";
import { Job, Education } from "@/types/database";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default async function DirectoryMemberPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: viewerProfile } = await supabase.from("profiles").select("id, access_level, admin_status, verification_status").eq("id", user.id).single();
  const isVerified = hasFullAccess(viewerProfile);

  let query = supabase.from("profiles").select("*");
  if (isUUID(params.slug)) query = query.or(`slug.eq.${params.slug},id.eq.${params.slug}`);
  else query = query.eq("slug", params.slug);

  const { data: member, error } = await query.single();
  if (error || !member || member.show_in_directory === false) notFound();

  const visibleContacts = getVisibleContactFields(member, viewerProfile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/directory" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">← Back to directory</Link>
      </div>

      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm text-3xl font-bold text-white shadow-inner border border-white/20">
              {getAvatarFallback(member)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{member.full_name}</h1>
                 {member.featured_in_presentation && <Star className="w-6 h-6 fill-amber-300 text-amber-300 drop-shadow-md" title="Featured Alumni" />}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {member.account_type === "Faculty" && <Badge variant="outline" className="border-white/30 bg-white/10 text-white"><BookOpen className="w-3 h-3 mr-1"/> Faculty</Badge>}
                {member.graduation_year && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Class of {member.graduation_year}</Badge>}
                {member.roll_number && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Kit No: {member.roll_number}</Badge>}
                {member.regular_self_finance && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">{member.regular_self_finance}</Badge>}
                
                {isVerified ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0"><ShieldCheck className="w-3 h-3 mr-1"/> Verified View</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/80 text-white hover:bg-amber-600 border-0"><Lock className="w-3 h-3 mr-1"/> Unverified</Badge>
                )}
              </div>
              {isVerified && (member.current_position || member.profession) && (
                <p className="mt-4 text-white/90 text-lg font-medium">{member.current_position || member.profession} {member.current_organization && `at ${member.current_organization}`}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isVerified && (
        <Card className="mb-8 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-8 items-center text-center">
            <div className="p-4 bg-amber-100 rounded-full text-amber-600 mb-2"><Lock className="h-8 w-8" /></div>
            <h2 className="font-extrabold text-amber-900 text-2xl">Details Hidden</h2>
            <p className="text-amber-800 max-w-2xl leading-relaxed text-lg">Your account is currently Unverified. We protect professional histories, locations, and contact details for verified members only.</p>
            <Link href="/profile/complete" className="mt-4 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-900 shadow-lg transition-all">Complete Profile to Request Verification</Link>
          </CardContent>
        </Card>
      )}

      {isVerified && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          <div className="space-y-6 lg:col-span-2">
            
            {(member.bio || member.message_for_koharians || member.languages?.length) && (
               <Card className="rounded-3xl border-0 shadow-md bg-white">
                 <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg">About & Legacy</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6 text-sm text-slate-700">
                   {member.bio && <p className="leading-relaxed text-base">{member.bio}</p>}
                   {member.message_for_koharians && (
                     <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 relative">
                        <MessageSquare className="absolute top-4 right-4 w-8 h-8 text-blue-200 opacity-50" />
                        <h3 className="mb-2 font-bold text-blue-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Message for Koharians</h3>
                        <p className="leading-relaxed text-blue-800 italic font-medium whitespace-pre-wrap">"{member.message_for_koharians}"</p>
                     </div>
                   )}
                   {member.languages && member.languages.length > 0 && (
                     <div className="flex flex-wrap gap-2 items-center"><Globe className="w-5 h-5 text-slate-400 mr-1"/><span className="font-semibold text-slate-900 mr-2">Languages:</span>{member.languages.map((lang: string, i: number) => <Badge key={i} variant="secondary" className="bg-slate-100">{lang}</Badge>)}</div>
                   )}
                 </CardContent>
               </Card>
            )}

            {member.job_history && (member.job_history as Job[]).length > 0 && (
              <Card className="rounded-3xl border-0 shadow-md bg-white">
                <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-slate-400"/> Work History</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-5">
                   <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100">
                      {member.employment_status && <div><span className="text-xs font-bold text-slate-400 uppercase block">Status</span><span className="font-semibold">{member.employment_status}</span></div>}
                      {member.experience_years && <div><span className="text-xs font-bold text-slate-400 uppercase block">Experience</span><span className="font-semibold">{member.experience_years} Years</span></div>}
                   </div>
                   {(member.job_history as Job[]).map((job, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0"><Building className="w-6 h-6 text-slate-400"/></div>
                        <div>
                           <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                           <div className="text-slate-600 font-medium">{job.company}</div>
                           <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">{job.start_date} — {job.end_date || 'Present'}</div>
                        </div>
                     </div>
                   ))}
                </CardContent>
              </Card>
            )}

            {member.higher_education && (member.higher_education as Education[]).length > 0 && (
              <Card className="rounded-3xl border-0 shadow-md bg-white">
                <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5 text-slate-400"/> Higher Education</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-5">
                   {(member.higher_education as Education[]).map((edu, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0"><BookOpen className="w-6 h-6 text-slate-400"/></div>
                        <div>
                           <h4 className="font-bold text-slate-900 text-base">{edu.institution}</h4>
                           <div className="text-slate-600 font-medium">{edu.degree} in {edu.field}</div>
                           <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">{edu.start_date} — {edu.end_date || 'Present'}</div>
                        </div>
                     </div>
                   ))}
                </CardContent>
              </Card>
            )}

            {(member.achievements_brc || member.achievements_after || member.favorite_teacher) && (
               <Card className="rounded-3xl border-0 shadow-md bg-white">
                 <CardHeader className="pb-4 bg-slate-50 border-b border-slate-100"><CardTitle className="text-lg flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Milestones & Memories</CardTitle></CardHeader>
                 <CardContent className="p-6 space-y-6">
                    {member.favorite_teacher && <div><h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5"><Heart className="w-4 h-4 text-rose-500" /> Favorite BRC Teacher</h4><p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{member.favorite_teacher}</p></div>}
                    {member.achievements_brc && <div><h4 className="font-bold text-slate-900 mb-1.5">BRC Achievements</h4><p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{member.achievements_brc}</p></div>}
                    {member.achievements_after && <div><h4 className="font-bold text-slate-900 mb-1.5">Later Achievements</h4><p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{member.achievements_after}</p></div>}
                 </CardContent>
               </Card>
            )}
          </div>

          <div className="space-y-6">
            
            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg">Location</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"><MapPin className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current City</div><span className="font-bold text-slate-900">{member.current_city || "Unknown city"}{member.current_country ? `, ${member.current_country}` : ""}</span></div>
                </div>
                {(member.home_city || member.home_district) && (
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"><Home className="h-5 w-5 text-emerald-600" /></div>
                    <div><div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-0.5">Originally From</div><span className="font-bold text-emerald-900">{member.home_city ? `${member.home_city}` : ""}{member.home_district ? ` (District ${member.home_district})` : ""}</span></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-md bg-white">
              <CardHeader className="pb-4"><CardTitle className="text-lg">Contact Info</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {visibleContacts.email && (
                  <a href={`mailto:${visibleContacts.email}`} className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Mail className="h-5 w-5" /></div>
                    <span className="truncate font-medium text-slate-900">{visibleContacts.email}</span>
                  </a>
                )}
                
                {visibleContacts.linkedin_url && (
                  <a href={visibleContacts.linkedin_url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary group-hover:bg-primary/10 transition-colors"><Linkedin className="h-5 w-5" /></div>
                    <span className="font-medium text-slate-900">View LinkedIn</span>
                  </a>
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
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}