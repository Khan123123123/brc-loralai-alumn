import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback } from "@/lib/utils/profile";
import {
  Briefcase,
  Building,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  UserCircle2,
  Users,
  Lock,
  AlertTriangle,
  Globe,
  Mail,
  Linkedin
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
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "qaisrani12116@gmail.com";

  const search = (searchParams.search as string) || "";
  const yearFilter = (searchParams.year as string) || "all";
  const districtFilter = (searchParams.district as string) || "all";
  const industryFilter = (searchParams.industry as string) || "all";
  const locationFilter = (searchParams.location as string) || "all";
  const rankFilter = (searchParams.rank as string) || "all";
  const orgFilter = (searchParams.organization as string) || "all";
  const mentorsOnly = searchParams.mentors === "true";

  // HIDDEN FEATURE: ANTI-SCRAPING PAGINATION LOGIC
  const PAGE_SIZE = 24;
  const page = parseInt((searchParams.page as string) || "0");
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("profiles").select("*", { count: "exact" }).neq("id", user.id).eq("show_in_directory", true).order("graduation_year", { ascending: false }).order("full_name", { ascending: true });

 // DEEP SEARCH LOGIC (Using Supabase Generated Column)
  if (search) {
    // We wrap the search term in % to match text anywhere in the string
    query = query.ilike("deep_search_text", `%${search}%`);
  }
  
  if (yearFilter !== "all") query = query.eq("graduation_year", parseInt(yearFilter));
  if (districtFilter !== "all") query = query.eq("home_district", districtFilter);
  if (industryFilter !== "all") query = query.eq("industry", industryFilter);
  if (locationFilter !== "all") query = query.or(`current_city.ilike.%${locationFilter}%,current_country.ilike.%${locationFilter}%`);
  if (rankFilter !== "all") query = query.ilike("current_position", `%${rankFilter}%`);
  if (orgFilter !== "all") query = query.ilike("current_organization", `%${orgFilter}%`);
  if (mentorsOnly) query = query.eq("available_for_mentoring", true);

  // Apply range for pagination
  query = query.range(from, to);

  const { data: rawProfiles, count } = await query;
  const profiles = rawProfiles || [];

  const { data: filterProfiles } = await supabase.from("profiles").select("graduation_year, home_district, industry, current_city, current_country, current_position, current_organization, show_in_directory").eq("show_in_directory", true);
  const visibleFilterProfiles = filterProfiles || [];

  const extractUnique = (field: keyof typeof visibleFilterProfiles[0]) => Array.from(new Set(visibleFilterProfiles.map((p) => p[field]).filter(Boolean))).sort();

  const years = Array.from(new Set(visibleFilterProfiles.map((p) => p.graduation_year).filter((v): v is number => typeof v === "number"))).sort((a, b) => b - a);
  const districts = extractUnique("home_district") as string[];
  const industries = extractUnique("industry") as string[];
  const locations = Array.from(new Set([...visibleFilterProfiles.map(p => p.current_city).filter(Boolean), ...visibleFilterProfiles.map(p => p.current_country).filter(Boolean)])).sort() as string[];
  const ranks = extractUnique("current_position") as string[];
  const orgs = extractUnique("current_organization") as string[];

  // GLOBAL REACH LOGIC
  const countryCounts = visibleFilterProfiles.reduce((acc: Record<string, number>, p) => {
    if (p.current_country) acc[p.current_country] = (acc[p.current_country] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts).sort(([, a], [, b]) => b - a).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* VIBRANT UPENN COLOR DIRECTORY HEADER */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-secondary p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/20 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between z-10">
          <div>
            <div className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner">
              <UserCircle2 className="h-5 w-5 text-white/80" />
              <span className="text-sm sm:text-base font-bold text-white">
                {viewerProfile?.full_name || user.email}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-extrabold ml-1 shadow-sm">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-extrabold ml-1 shadow-sm">
                  <Lock className="h-3 w-3" /> Unverified
                </span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-white drop-shadow-sm">
              Koharian Alumni Directory
            </h1>
            <p className="mt-4 max-w-2xl text-white/90 text-lg leading-relaxed">
              Search for fellow alumni by location, profession, organization, and graduation year.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/profile/me" className="inline-flex items-center rounded-full bg-white text-primary hover:bg-slate-100 px-6 py-3 text-sm font-extrabold transition-all shadow-lg hover:shadow-xl">
              View My Profile
            </Link>
            <Link href="/profile/complete" className="inline-flex items-center rounded-full border-2 border-white/30 bg-black/10 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* GLOBAL REACH STATS */}
      <div className="mb-8 p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl animate-in fade-in duration-700">
        <h3 className="flex items-center gap-2 font-bold mb-3 text-slate-300 text-sm tracking-widest uppercase">
          <Globe className="w-4 h-4 text-blue-400" /> Koharians Global Presence
        </h3>
        <div className="flex flex-wrap gap-3">
          {topCountries.map(([country, cnt]) => (
            <div key={country} className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <span className="font-bold text-sm">{country}</span>
              <span className="ml-2 text-primary font-extrabold text-xs">{cnt as number}</span>
            </div>
          ))}
        </div>
      </div>

      {!isVerified && (
        <Card className="mb-8 rounded-3xl border-amber-200/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/50 backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-500 text-lg">
                <Lock className="h-5 w-5" /> Unverified View
              </div>
              <p className="text-sm text-amber-800/90 dark:text-amber-400/90 max-w-3xl leading-relaxed">
                Your account is currently Unverified. You are viewing restricted profile data. Please wait for an administrator to verify your account to unlock full professional details and contact information. Verification may take upto 72 hours. If you have filled all your information, you do not need to take any action now.
              </p>
            </div>
            <Link href="/profile/complete" className="shrink-0 inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-amber-500 dark:text-slate-950 px-6 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform shadow-lg mt-4 md:mt-0">
              Check Profile
            </Link>
          </CardContent>
        </Card>
      )}

      {/* SEARCH FILTERS */}
      <Card className="mb-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="md:col-span-3 lg:col-span-6 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input name="search" defaultValue={search} placeholder="Deep search by name, bio, skills, company, or city..." className="pl-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-primary text-base shadow-sm" />
            </div>
            <select name="location" defaultValue={locationFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Locations</option>{locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}</select>
            <select name="organization" defaultValue={orgFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Organizations</option>{orgs.map((org) => (<option key={org} value={org}>{org}</option>))}</select>
            <select name="rank" defaultValue={rankFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Roles</option>{ranks.map((rank) => (<option key={rank} value={rank}>{rank}</option>))}</select>
            <select name="year" defaultValue={yearFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Batches</option>{years.map((year) => (<option key={year} value={String(year)}>Class of {year}</option>))}</select>
            <select name="district" defaultValue={districtFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Districts</option>{districts.map((district) => (<option key={district} value={district}>{district}</option>))}</select>
            <select name="industry" defaultValue={industryFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Industries</option>{industries.map((industry) => (<option key={industry} value={industry}>{industry}</option>))}</select>
            
            <div className="flex items-center space-y-0 gap-3 h-11 px-4 border rounded-xl bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800 md:col-span-3 lg:col-span-6">
              <input type="checkbox" name="mentors" value="true" defaultChecked={mentorsOnly} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Available for Mentoring Only</label>
            </div>

            <div className="md:col-span-3 lg:col-span-6 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button type="submit" className="rounded-full bg-primary text-white hover:bg-blue-900 px-8 py-2.5 text-sm font-bold shadow-lg transition-transform hover:scale-105">Apply Filters</button>
              <Link href="/directory" className="rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-8 py-2.5 text-sm font-bold transition-all">Reset Filters</Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border dark:border-slate-800 shadow-sm">
          <Users className="h-4 w-4 text-primary" />
          <span><strong className="text-slate-900 dark:text-white">{count || 0}</strong> Total Matches</span>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="rounded-3xl shadow-sm border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <CardContent className="p-16 text-center">
            <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Alumni Found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your search filters to find more people.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {profiles.map((profile, index) => {
            const memberUrl = `/directory/${profile.slug || profile.id}`;
            const delay = `${Math.min(index * 30, 400)}ms`;

            return (
              <div key={profile.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: delay }}>
                <Link href={memberUrl} className="group block h-full">
                  <Card className="h-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/50 relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-5 flex items-start gap-4 flex-1">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white shadow-md group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                          {getAvatarFallback(profile)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{profile.full_name}</h3>
                          <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                            {profile.entry_year && <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">Entry: {profile.entry_year}</span>}
                            {profile.graduation_year && <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md"><GraduationCap className="h-3.5 w-3.5 text-secondary mr-1" /> Batch '{profile.graduation_year}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
                        {profile.home_district && (
                          <div className="flex items-start gap-3"><UserCircle2 className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" /><span className="font-semibold text-slate-800 dark:text-slate-200">District: {profile.home_district}</span></div>
                        )}

                        {isVerified ? (
                          <>
                            {profile.current_position && <div className="flex items-start gap-3"><Briefcase className="mt-0.5 h-4 w-4 text-primary shrink-0" /><span className="font-semibold text-slate-800 dark:text-slate-200">{profile.current_position}</span></div>}
                            {profile.current_organization && <div className="flex items-start gap-3"><Building className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" /><span className="truncate">{profile.current_organization}</span></div>}
                            {(profile.current_city || profile.current_country) && <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-secondary shrink-0" /><span>{profile.current_city || "Unknown city"}{profile.current_country ? `, ${profile.current_country}` : ""}</span></div>}
                            
                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                <span className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary transition-all py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                  <Mail className="w-3.5 h-3.5" /> Direct Email
                                </span>
                                {profile.linkedin_url && (
                                  <span className="px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Linkedin className="w-3.5 h-3.5" />
                                  </span>
                                )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-start gap-3 text-amber-600/80 dark:text-amber-500/80 italic mt-4 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                             <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                             <span className="text-xs font-medium">Professional details hidden (Unverified)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">{isVerified ? <><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified</> : <><Lock className="h-4 w-4 text-amber-500" /> Locked</>}</span>
                        {profile.available_for_mentoring && <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded text-[10px] border border-emerald-500/20">Mentor</span>}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-primary">View Profile &rarr;</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {count && count > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 mb-12">
          {page > 0 && (
            <Link 
              href={`/directory?search=${search}&year=${yearFilter}&district=${districtFilter}&industry=${industryFilter}&location=${locationFilter}&rank=${rankFilter}&organization=${orgFilter}&mentors=${mentorsOnly}&page=${page - 1}`} 
              className="w-full sm:w-auto text-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Previous Page
            </Link>
          )}
          
          <span className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            Page {page + 1} of {Math.ceil(count / PAGE_SIZE)}
          </span>

          {(page + 1) * PAGE_SIZE < count && (
            <Link 
              href={`/directory?search=${search}&year=${yearFilter}&district=${districtFilter}&industry=${industryFilter}&location=${locationFilter}&rank=${rankFilter}&organization=${orgFilter}&mentors=${mentorsOnly}&page=${page + 1}`} 
              className="w-full sm:w-auto text-center rounded-full bg-primary text-white px-8 py-3 text-sm font-bold hover:bg-blue-900 transition-all shadow-md"
            >
              Next Page
            </Link>
          )}
        </div>
      )}

      {/* Directory Integrity Banner */}
      <div className="mb-12 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 flex flex-col sm:flex-row items-center gap-5 text-red-800 dark:text-red-300 shadow-inner">
        <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/50 p-3 rounded-full shrink-0">
          <AlertTriangle className="h-6 w-6 text-secondary dark:text-red-400" />
        </div>
        <div className="text-sm text-center sm:text-left flex-1">
          <strong className="font-extrabold text-red-900 dark:text-red-200 block text-base mb-1">Directory Integrity</strong> 
          If you find anyone in this directory who is not a true Koharian, please let us know immediately so we can remove them.
        </div>
        <a 
          href={`mailto:${adminEmail}?subject=Network%20Integrity%20Report&body=I%20would%20like%20to%20report%20a%20profile%20that%20does%20not%20belong%20to%20a%20Koharian.%0A%0AProfile%20Name:%20`} 
          className="w-full sm:w-auto text-center shrink-0 bg-secondary hover:bg-red-800 text-white text-sm font-bold px-6 py-3 rounded-full transition-transform hover:scale-105 shadow-md"
        >
          Report Profile
        </a>
      </div>

    </div>
  );
}