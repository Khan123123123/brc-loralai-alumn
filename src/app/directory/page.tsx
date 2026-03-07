import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canAppearInDirectory, hasFullAccess } from "@/lib/utils/access";
import { getAvatarFallback } from "@/lib/utils/profile";
import {
  Briefcase,
  Building,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
  Lock,
  AlertTriangle,
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

  let query = supabase.from("profiles").select("*").neq("id", user.id).eq("show_in_directory", true).order("graduation_year", { ascending: false }).order("full_name", { ascending: true });

  if (search) query = query.or([`full_name.ilike.%${search}%`, `profession.ilike.%${search}%`, `current_city.ilike.%${search}%`, `current_country.ilike.%${search}%`, `current_organization.ilike.%${search}%`].join(","));
  if (yearFilter !== "all") query = query.eq("graduation_year", parseInt(yearFilter));
  if (districtFilter !== "all") query = query.eq("home_district", districtFilter);
  if (industryFilter !== "all") query = query.eq("industry", industryFilter);
  if (locationFilter !== "all") query = query.or(`current_city.ilike.%${locationFilter}%,current_country.ilike.%${locationFilter}%`);
  if (rankFilter !== "all") query = query.ilike("current_position", `%${rankFilter}%`);
  if (orgFilter !== "all") query = query.ilike("current_organization", `%${orgFilter}%`);

  const { data: rawProfiles } = await query;
  const profiles = (rawProfiles || []).filter((profile) => canAppearInDirectory(profile));

  const { data: filterProfiles } = await supabase.from("profiles").select("graduation_year, home_district, industry, current_city, current_country, current_position, current_organization, show_in_directory").eq("show_in_directory", true);
  const visibleFilterProfiles = (filterProfiles || []).filter((item) => canAppearInDirectory(item));

  const extractUnique = (field: keyof typeof visibleFilterProfiles[0]) => Array.from(new Set(visibleFilterProfiles.map((p) => p[field]).filter(Boolean))).sort();

  const years = Array.from(new Set(visibleFilterProfiles.map((p) => p.graduation_year).filter((v): v is number => typeof v === "number"))).sort((a, b) => b - a);
  const districts = extractUnique("home_district") as string[];
  const industries = extractUnique("industry") as string[];
  const locations = Array.from(new Set([...visibleFilterProfiles.map(p => p.current_city).filter(Boolean), ...visibleFilterProfiles.map(p => p.current_country).filter(Boolean)])).sort() as string[];
  const ranks = extractUnique("current_position") as string[];
  const orgs = extractUnique("current_organization") as string[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* VIBRANT DIRECTORY HEADER */}
      <div className="mb-8 rounded-[2.5rem] bg-gradient-to-br from-blue-950 via-primary to-slate-900 p-10 text-primary-foreground shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between z-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm font-semibold text-blue-100 shadow-inner">
              <Sparkles className="h-4 w-4 text-secondary" /> Global Intelligence
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-white drop-shadow-sm">
              Alumni Directory
            </h1>
            <p className="mt-4 max-w-2xl text-blue-100/90 text-lg leading-relaxed">
              Query the Koharian diaspora. Locate peers by rank, corporate affiliation, and geography.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/profile/me" className="inline-flex items-center rounded-full bg-secondary hover:bg-yellow-400 px-6 py-3 text-sm font-extrabold text-blue-950 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]">
              View My Profile
            </Link>
            <Link href="/profile/complete" className="inline-flex items-center rounded-full border-2 border-white/20 bg-black/20 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all">
              Update Data
            </Link>
          </div>
        </div>
      </div>

      {!isVerified && (
        <Card className="mb-8 rounded-3xl border-amber-200/50 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900/50 backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-500 text-lg">
                <Lock className="h-5 w-5" /> Unverified View
              </div>
              <p className="text-sm text-amber-800/80 dark:text-amber-400/80 max-w-2xl">
                Your account is Unverified. You are currently viewing restricted teaser data. Secure verification from an administrator to unlock direct contact coordinates and professional histories.
              </p>
            </div>
            <Link href="/profile/complete" className="shrink-0 inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-amber-500 dark:text-slate-950 px-6 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform shadow-lg">
              Initialize Verification
            </Link>
          </CardContent>
        </Card>
      )}

      {/* SLEEK SEARCH FILTER */}
      <Card className="mb-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary dark:text-blue-400" /> Filter Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="md:col-span-3 lg:col-span-6 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input name="search" defaultValue={search} placeholder="Global keyword query..." className="pl-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-primary text-base shadow-sm" />
            </div>
            <select name="location" defaultValue={locationFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">Global (All)</option>{locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}</select>
            <select name="organization" defaultValue={orgFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Orgs</option>{orgs.map((org) => (<option key={org} value={org}>{org}</option>))}</select>
            <select name="rank" defaultValue={rankFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Ranks</option>{ranks.map((rank) => (<option key={rank} value={rank}>{rank}</option>))}</select>
            <select name="year" defaultValue={yearFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Batches</option>{years.map((year) => (<option key={year} value={String(year)}>Class of {year}</option>))}</select>
            <select name="district" defaultValue={districtFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Districts</option>{districts.map((district) => (<option key={district} value={district}>{district}</option>))}</select>
            <select name="industry" defaultValue={industryFilter} className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary"><option value="all">All Industries</option>{industries.map((industry) => (<option key={industry} value={industry}>{industry}</option>))}</select>
            
            <div className="md:col-span-3 lg:col-span-6 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button type="submit" className="rounded-full bg-primary text-white hover:bg-blue-900 px-8 py-2.5 text-sm font-bold shadow-lg transition-transform hover:scale-105">Execute Query</button>
              <Link href="/directory" className="rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-8 py-2.5 text-sm font-bold transition-all">Clear Params</Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border dark:border-slate-800 shadow-sm">
          <Users className="h-4 w-4 text-primary dark:text-blue-400" />
          <span><strong className="text-slate-900 dark:text-white">{profiles.length}</strong> Target Profiles Located</span>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="rounded-3xl shadow-sm border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <CardContent className="p-16 text-center">
            <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Matches Found</h3>
            <p className="mt-2 text-slate-500">Broaden your filter parameters to return results.</p>
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
                  <Card className="h-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30 dark:hover:border-blue-500/50 relative overflow-hidden">
                    
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardContent className="p-6">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-800 text-xl font-bold text-white shadow-md group-hover:from-secondary group-hover:to-yellow-600 group-hover:text-blue-950 transition-all duration-300">
                          {getAvatarFallback(profile)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{profile.full_name}</h3>
                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
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
                          </>
                        ) : (
                          <div className="flex items-start gap-3 text-amber-600/80 dark:text-amber-500/80 italic mt-4 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                             <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                             <span className="text-xs font-medium">Professional intel redacted (Unverified)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">{isVerified ? <><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified</> : <><Lock className="h-4 w-4 text-amber-500" /> Locked</>}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-primary dark:text-blue-400">Expand &rarr;</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Directory Integrity Banner - MOVED TO BOTTOM */}
      <div className="mb-12 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 flex flex-col sm:flex-row items-center gap-5 text-red-800 dark:text-red-300 shadow-inner">
        <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/50 p-3 rounded-full shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-sm text-center sm:text-left flex-1">
          <strong className="font-extrabold text-red-900 dark:text-red-200 block text-base mb-1">Protect The Network</strong> 
          If you identify a profile belonging to someone who is not a true Koharian, please report it immediately to maintain directory integrity.
        </div>
        <a 
          href={`mailto:${adminEmail}?subject=Network%20Integrity%20Report&body=I%20would%20like%20to%20report%20a%20profile%20that%20does%20not%20belong%20to%20a%20Koharian.%0A%0AProfile%20Name:%20`} 
          className="w-full sm:w-auto text-center shrink-0 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white text-sm font-bold px-6 py-3 rounded-full transition-transform hover:scale-105 shadow-md"
        >
          Report Imposter
        </a>
      </div>

    </div>
  );
}