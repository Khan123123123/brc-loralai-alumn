import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback } from "@/lib/utils/profile";
import { ContactBox } from "@/components/ContactBox";
import {
  Briefcase, Building, GraduationCap, MapPin, Search, ShieldCheck,
  UserCircle2, Users, Lock, AlertTriangle, Globe, Mail, Linkedin,
  Calendar, Megaphone, BookOpen, LayoutDashboard, Settings, ChevronDown
} from "lucide-react";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: viewerProfile } = await supabase.from("profiles").select("id, full_name, access_level, admin_status, verification_status, is_profile_complete").eq("id", user.id).single();
  const isVerified = hasFullAccess(viewerProfile);
  
  // STRICT HARDCODED ADMIN CHECK
  const isAdmin = user.email?.toLowerCase() === "brcloralai123@gmail.com";

  const search = (searchParams.search as string) || "";
  const yearFilter = (searchParams.year as string) || "all";
  const districtFilter = (searchParams.district as string) || "all";
  const industryFilter = (searchParams.industry as string) || "all";
  const mentorsOnly = searchParams.mentors === "true";
  const facultyOnly = searchParams.faculty === "true";

  const PAGE_SIZE = 24;
  const page = parseInt((searchParams.page as string) || "0");
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("profiles").select("*", { count: "exact" }).neq("id", user.id).eq("show_in_directory", true).order("graduation_year", { ascending: false }).order("full_name", { ascending: true });

  if (search) {
    query = query.ilike("deep_search_text", `%${search}%`);
  }
  
  if (yearFilter !== "all") query = query.eq("graduation_year", parseInt(yearFilter));
  if (districtFilter !== "all") query = query.eq("home_district", districtFilter);
  if (industryFilter !== "all") query = query.eq("industry", industryFilter);
  if (mentorsOnly) query = query.eq("available_for_mentoring", true);
  if (facultyOnly) query = query.eq("account_type", "Faculty");

  query = query.range(from, to);

  const { data: rawProfiles, count } = await query;
  const profiles = rawProfiles || [];

  const { data: filterProfiles } = await supabase.from("profiles").select("graduation_year, home_district, current_country").eq("show_in_directory", true);
  const years = Array.from(new Set(filterProfiles?.map((p) => p.graduation_year).filter((v): v is number => typeof v === "number"))).sort((a, b) => b - a);
  const districts = Array.from(new Set(filterProfiles?.map((p) => p.home_district).filter(Boolean))).sort() as string[];

  const countryCounts = filterProfiles?.reduce((acc: Record<string, number>, p) => {
    if (p.current_country) acc[p.current_country] = (acc[p.current_country] || 0) + 1;
    return acc;
  }, {}) || {};
  const topCountries = Object.entries(countryCounts).sort(([, a], [, b]) => b - a).slice(0, 4);

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* TOP ROW: USER STATUS & ADMIN TOGGLES */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-2 shadow-sm">
            <UserCircle2 className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">{viewerProfile?.full_name || user.email}</span>
            {isVerified ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 uppercase text-[10px] font-extrabold tracking-tighter ml-1">Verified</Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 uppercase text-[10px] font-extrabold tracking-tighter ml-1">Unverified</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="relative group">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white font-bold px-5 py-2.5 text-sm shadow-lg hover:bg-slate-800 transition-all">
                <Settings className="w-4 h-4 text-emerald-400" /> Admin Controls <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              <div className="absolute right-0 mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="flex flex-col gap-1 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100">
                  <Link href="/admin" className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" /> User Approvals
                  </Link>
                  <Link href="/admin/announcements" className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                    <Megaphone className="w-4 h-4 text-amber-600" /> Manage Notices
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HEADER HERO */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-secondary p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl drop-shadow-sm text-white">Koharian Network</h1>
            <p className="mt-4 max-w-2xl text-white/90 text-lg leading-relaxed font-medium">Reconnecting the legacy of Loralai. Search for fellow alumni and respected faculty members.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/profile/me" className="rounded-full bg-white text-primary px-8 py-3 text-sm font-extrabold shadow-lg hover:shadow-xl hover:scale-105 transition-all">View My Profile</Link>
            <Link href="/profile/complete" className="rounded-full border-2 border-white/30 bg-black/10 backdrop-blur-md px-8 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all">Edit Profile</Link>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT BOARD */}
      {announcements && announcements.length > 0 && (
        <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          {announcements.map((ann) => (
            <div key={ann.id} className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-5 md:items-center justify-between ${
              ann.type === 'Urgent' ? 'bg-red-50 border-red-200' :
              ann.type === 'Event' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
               <div className="flex items-start gap-5">
                  <div className={`p-3.5 rounded-2xl shrink-0 shadow-inner ${
                    ann.type === 'Urgent' ? 'bg-red-100 text-red-600' :
                    ann.type === 'Event' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {ann.type === 'Urgent' ? <AlertTriangle className="w-7 h-7" /> : ann.type === 'Event' ? <Calendar className="w-7 h-7" /> : <Megaphone className="w-7 h-7" />}
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1.5">
                       <Badge variant="outline" className={`uppercase text-[10px] font-extrabold tracking-widest bg-white/70 ${
                          ann.type === 'Urgent' ? 'text-red-700 border-red-300' :
                          ann.type === 'Event' ? 'text-blue-700 border-blue-300' : 'text-emerald-700 border-emerald-300'
                       }`}>{ann.type}</Badge>
                       <span className="text-xs text-slate-500 font-bold">{new Date(ann.created_at).toLocaleDateString()}</span>
                     </div>
                     <h4 className="text-lg font-extrabold text-slate-900">{ann.title}</h4>
                     <p className="text-sm text-slate-700 mt-1 max-w-4xl leading-relaxed">{ann.content}</p>
                  </div>
               </div>
               {ann.link_url && (
                 <a href={ann.link_url} target="_blank" rel="noreferrer" className="shrink-0 text-center px-8 py-3 rounded-full text-sm font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:scale-105 transition-transform">
                   Read Details &rarr;
                 </a>
               )}
            </div>
          ))}
        </div>
      )}

      {/* SEARCH FILTERS */}
      <Card className="mb-8 rounded-3xl border border-slate-200 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-8">
          <form className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-4 lg:col-span-5 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input name="search" defaultValue={search} placeholder="Search by name, physics teacher, batch, or company..." className="pl-12 h-12 rounded-2xl border-slate-200 shadow-inner bg-slate-50/50" />
            </div>
            <select name="year" defaultValue={yearFilter} className="h-11 rounded-xl border border-slate-200 px-3 text-sm shadow-sm font-bold bg-white cursor-pointer"><option value="all">All Batches</option>{years.map((year) => (<option key={year} value={String(year)}>Class of {year}</option>))}</select>
            <select name="district" defaultValue={districtFilter} className="h-11 rounded-xl border border-slate-200 px-3 text-sm shadow-sm font-bold bg-white cursor-pointer"><option value="all">All Districts</option>{districts.map((district) => (<option key={district} value={district}>{district}</option>))}</select>
            
            <div className="flex items-center gap-3 h-11 px-4 border border-slate-200 rounded-xl bg-white shadow-sm">
              <input type="checkbox" name="mentors" value="true" defaultChecked={mentorsOnly} className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer" />
              <label className="text-sm font-bold text-slate-700 cursor-pointer">Mentors Only</label>
            </div>
            
            <div className="flex items-center gap-3 h-11 px-4 border border-indigo-100 rounded-xl bg-indigo-50 shadow-sm">
              <input type="checkbox" name="faculty" value="true" defaultChecked={facultyOnly} className="w-4 h-4 rounded text-indigo-600 border-indigo-300 focus:ring-indigo-600 cursor-pointer" />
              <label className="text-sm font-bold text-indigo-900 cursor-pointer flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Faculty Only
              </label>
            </div>

            <button type="submit" className="rounded-xl bg-primary text-white font-extrabold h-11 hover:bg-blue-900 shadow-md hover:shadow-lg transition-all">Search Network</button>
          </form>
        </CardContent>
      </Card>

      {/* RESULTS */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-100 px-5 py-2.5 rounded-full shadow-sm">
          <Users className="h-4 w-4 text-primary" />
          <span>Found <strong className="text-slate-900">{count || 0}</strong> matches</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
        {profiles.map((profile) => {
          const isFaculty = profile.account_type === "Faculty";
          const memberUrl = `/directory/${profile.slug || profile.id}`;

          return (
            <Link key={profile.id} href={memberUrl} className="group block h-full">
              <Card className="h-full rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden bg-white">
                <div className={`absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isFaculty ? 'bg-indigo-500' : 'bg-primary'}`}></div>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md transition-transform group-hover:scale-105 ${isFaculty ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                      {getAvatarFallback(profile)}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-extrabold text-xl truncate transition-colors ${isFaculty ? 'group-hover:text-indigo-600' : 'group-hover:text-primary'}`}>{profile.full_name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {isFaculty ? (
                           <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 uppercase text-[9px] font-extrabold tracking-widest"><BookOpen className="w-3 h-3 mr-1"/> Faculty</Badge>
                        ) : (
                           <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[9px] font-extrabold tracking-widest"><GraduationCap className="w-3 h-3 mr-1"/> Class of '{profile.graduation_year}</Badge>
                        )}
                        {profile.available_for_mentoring && <Badge className="bg-emerald-500 text-white text-[9px] font-extrabold tracking-widest">Mentor</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  {isVerified ? (
                    <div className="space-y-3.5 text-sm text-slate-600 border-t pt-4 mt-2">
                      {isFaculty && profile.subjects_taught && profile.subjects_taught.length > 0 && (
                        <div className="flex items-start gap-3"><BookOpen className="w-4 h-4 text-indigo-500 mt-0.5" /><span className="font-bold text-indigo-900 leading-tight">Taught: {profile.subjects_taught.join(", ")}</span></div>
                      )}
                      <div className="flex items-start gap-3"><Briefcase className={`w-4 h-4 mt-0.5 ${isFaculty ? 'text-indigo-400' : 'text-slate-400'}`} /><span className="font-semibold text-slate-800 leading-tight">{profile.current_position || (isFaculty ? "Faculty Member" : "Alumnus")}</span></div>
                      <div className="flex items-start gap-3"><Building className="w-4 h-4 text-slate-400 mt-0.5" /><span className="truncate leading-tight">{profile.current_organization || "Organization not set"}</span></div>
                      <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-secondary mt-0.5" /><span className="leading-tight font-medium">{profile.current_city}{profile.current_country ? `, ${profile.current_country}` : ""}</span></div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 items-center mt-4 border border-amber-100 shadow-inner">
                       <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                       <span className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-tighter">Profile Details Hidden (Unverified Account)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* PAGINATION */}
      {count && count > PAGE_SIZE && (
        <div className="flex justify-center border-t pt-8 mb-12 border-slate-100">
           <Link href={`/directory?search=${search}&page=${page + 1}`} className="rounded-full bg-slate-900 text-white px-10 py-3.5 text-sm font-extrabold shadow-xl hover:scale-105 hover:bg-slate-800 transition-all">
             Load More Results
           </Link>
        </div>
      )}

      {/* IN-APP CONTACT & REPORTING */}
      <ContactBox userEmail={user.email || ""} />

    </div>
  );
}