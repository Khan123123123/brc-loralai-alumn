import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("id, full_name, access_level, admin_status, verification_status, is_profile_complete")
    .eq("id", user.id)
    .single();

  const viewerHasFullAccess = hasFullAccess(viewerProfile);

  // Extract advanced filters
  const search = (searchParams.search as string) || "";
  const yearFilter = (searchParams.year as string) || "all";
  const districtFilter = (searchParams.district as string) || "all";
  const industryFilter = (searchParams.industry as string) || "all";
  const locationFilter = (searchParams.location as string) || "all";
  const rankFilter = (searchParams.rank as string) || "all";
  const orgFilter = (searchParams.organization as string) || "all";

  let query = supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .eq("show_in_directory", true)
    .order("graduation_year", { ascending: false })
    .order("full_name", { ascending: true });

  if (search) {
    query = query.or(
      [
        `full_name.ilike.%${search}%`,
        `profession.ilike.%${search}%`,
        `current_city.ilike.%${search}%`,
        `current_country.ilike.%${search}%`,
        `current_organization.ilike.%${search}%`,
      ].join(",")
    );
  }

  if (yearFilter !== "all") query = query.eq("graduation_year", parseInt(yearFilter));
  if (districtFilter !== "all") query = query.eq("home_district", districtFilter);
  if (industryFilter !== "all") query = query.eq("industry", industryFilter);
  if (locationFilter !== "all") query = query.or(`current_city.ilike.%${locationFilter}%,current_country.ilike.%${locationFilter}%`);
  if (rankFilter !== "all") query = query.ilike("current_position", `%${rankFilter}%`);
  if (orgFilter !== "all") query = query.ilike("current_organization", `%${orgFilter}%`);

  const { data: rawProfiles } = await query;
  const profiles = (rawProfiles || []).filter((profile) => canAppearInDirectory(profile));

  // Extract unique filter options for dropdowns
  const { data: filterProfiles } = await supabase
    .from("profiles")
    .select("graduation_year, home_district, industry, current_city, current_country, current_position, current_organization, show_in_directory")
    .eq("show_in_directory", true);

  const visibleFilterProfiles = (filterProfiles || []).filter((item) => canAppearInDirectory(item));

  const extractUnique = (field: keyof typeof visibleFilterProfiles[0]) => 
    Array.from(new Set(visibleFilterProfiles.map((p) => p[field]).filter(Boolean))).sort();

  const years = Array.from(new Set(visibleFilterProfiles.map((p) => p.graduation_year).filter((v): v is number => typeof v === "number"))).sort((a, b) => b - a);
  const districts = extractUnique("home_district") as string[];
  const industries = extractUnique("industry") as string[];
  
  // Combine cities and countries for the location filter
  const locations = Array.from(new Set([
    ...visibleFilterProfiles.map(p => p.current_city).filter(Boolean),
    ...visibleFilterProfiles.map(p => p.current_country).filter(Boolean)
  ])).sort() as string[];

  const ranks = extractUnique("current_position") as string[];
  const orgs = extractUnique("current_organization") as string[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-primary p-8 text-primary-foreground shadow-xl border-b-4 border-secondary relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4" />
              BRC Loralai Global Network
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
              Alumni Directory
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Execute precise searches across the Koharian diaspora. Filter by location, rank, and corporate affiliation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/profile/me" className="inline-flex items-center rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-yellow-400 transition-colors shadow-sm">
              My Profile
            </Link>
            <Link href="/profile/complete" className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {!viewerHasFullAccess && (
        <Card className="mb-8 rounded-3xl border-secondary/40 bg-yellow-50/50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-bold text-yellow-800">
                <Lock className="h-4 w-4" />
                Limited Access Mode
              </div>
              <p className="text-sm text-yellow-700/80">
                You are viewing redacted profiles. Complete your BRC verification to unlock full professional intelligence and direct contact links.
              </p>
            </div>
            <Link href="/profile/complete" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 shadow-sm transition-all whitespace-nowrap">
              Complete Verification
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 rounded-3xl border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Search className="w-5 h-5 text-secondary" /> 
            Advanced Intelligence Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="md:col-span-3 lg:col-span-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                name="search" 
                defaultValue={search} 
                placeholder="Global keyword search (names, companies, cities)..." 
                className="pl-9 bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20"
              />
            </div>

            <select name="location" defaultValue={locationFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">Global (All Locations)</option>
              {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
            </select>

            <select name="organization" defaultValue={orgFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">All Organizations</option>
              {orgs.map((org) => (<option key={org} value={org}>{org}</option>))}
            </select>

            <select name="rank" defaultValue={rankFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">All Ranks / Positions</option>
              {ranks.map((rank) => (<option key={rank} value={rank}>{rank}</option>))}
            </select>

            <select name="year" defaultValue={yearFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">All Batches</option>
              {years.map((year) => (<option key={year} value={String(year)}>Class of {year}</option>))}
            </select>

            <select name="district" defaultValue={districtFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">All Home Districts</option>
              {districts.map((district) => (<option key={district} value={district}>{district}</option>))}
            </select>

            <select name="industry" defaultValue={industryFilter} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-secondary focus:border-secondary shadow-sm">
              <option value="all">All Industries</option>
              {industries.map((industry) => (<option key={industry} value={industry}>{industry}</option>))}
            </select>

            <div className="md:col-span-3 lg:col-span-6 flex gap-3 pt-2 border-t mt-2 border-slate-100">
              <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md">
                Execute Filter
              </button>
              <Link href="/directory" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                Reset Matrix
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
          <Users className="h-4 w-4 text-primary" />
          <span><strong className="text-slate-900">{profiles.length}</strong> Alumni Identified</span>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="rounded-3xl shadow-sm border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-16 text-center">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Target Profiles Found</h3>
            <p className="mt-2 text-slate-500">Adjust your filter parameters to broaden the search scope.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile, index) => {
            const memberUrl = `/directory/${profile.slug || profile.id}`;
            const delay = `${Math.min(index * 50, 600)}ms`;

            return (
              <div 
                key={profile.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: delay }}
              >
                <Link href={memberUrl} className="group block h-full">
                  <Card className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-secondary/50 relative overflow-hidden">
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <CardContent className="p-6">
                      <div className="mb-5 flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-md ring-2 ring-white group-hover:bg-secondary group-hover:text-primary transition-colors">
                          {getAvatarFallback(profile)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {profile.full_name}
                            </h3>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500 font-medium">
                            {profile.graduation_year && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                <GraduationCap className="h-3.5 w-3.5 text-secondary" /> Class of {profile.graduation_year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-slate-600">
                        {profile.current_position && (
                          <div className="flex items-start gap-3">
                            <Briefcase className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800">{profile.current_position}</span>
                          </div>
                        )}
                        {viewerHasFullAccess ? (
                          profile.current_organization && (
                            <div className="flex items-start gap-3">
                              <Building className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                              <span className="truncate">{profile.current_organization}</span>
                            </div>
                          )
                        ) : (
                           <div className="flex items-start gap-3 text-slate-400 italic">
                             <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                             <span className="text-xs">Org hidden (Requires Verification)</span>
                           </div>
                        )}
                        {(profile.current_city || profile.current_country) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                            <span>
                              {profile.current_city || "Unknown city"}
                              {profile.current_country ? `, ${profile.current_country}` : ""}
                            </span>
                          </div>
                        )}
                        {profile.home_district && (
                          <div className="flex items-start gap-3">
                            <UserCircle2 className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                            <span>District: {profile.home_district}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm font-semibold text-slate-500 group-hover:text-primary transition-colors">
                        <span className="flex items-center gap-2">
                          {viewerHasFullAccess ? <><ShieldCheck className="h-4 w-4 text-emerald-500" /> Full Intel</> : <><Lock className="h-4 w-4" /> Safe Preview</>}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-secondary">
                          View Dossier &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}