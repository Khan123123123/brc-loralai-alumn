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

  const search = (searchParams.search as string) || "";
  const yearFilter = (searchParams.year as string) || "all";
  const districtFilter = (searchParams.district as string) || "all";
  const industryFilter = (searchParams.industry as string) || "all";

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
        `current_position.ilike.%${search}%`,
        `current_organization.ilike.%${search}%`,
      ].join(",")
    );
  }

  if (yearFilter !== "all") {
    query = query.eq("graduation_year", parseInt(yearFilter));
  }

  if (districtFilter !== "all") {
    query = query.eq("home_district", districtFilter);
  }

  if (industryFilter !== "all") {
    query = query.eq("industry", industryFilter);
  }

  const { data: rawProfiles } = await query;

  const profiles = (rawProfiles || []).filter((profile) => canAppearInDirectory(profile));

  const { data: filterProfiles } = await supabase
    .from("profiles")
    .select("graduation_year, home_district, industry, show_in_directory")
    .eq("show_in_directory", true);

  const visibleFilterProfiles = (filterProfiles || []).filter((item) =>
    canAppearInDirectory(item)
  );

  const years = Array.from(
    new Set(
      visibleFilterProfiles
        .map((p) => p.graduation_year)
        .filter((v): v is number => typeof v === "number")
    )
  ).sort((a, b) => b - a);

  const districts = Array.from(
    new Set(
      visibleFilterProfiles
        .map((p) => p.home_district)
        .filter((v): v is string => Boolean(v))
    )
  ).sort();

  const industries = Array.from(
    new Set(
      visibleFilterProfiles
        .map((p) => p.industry)
        .filter((v): v is string => Boolean(v))
    )
  ).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
              <Sparkles className="h-4 w-4" />
              BRC Loralai alumni directory
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Alumni Directory
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Browse Koharians by batch, district, city, and profession. Full member details unlock after profile completion and approval.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/profile/me"
              className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              My Profile
            </Link>
            <Link
              href="/profile/complete"
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {!viewerHasFullAccess && (
        <Card className="mb-8 rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                <Lock className="h-4 w-4" />
                Limited access mode
              </div>
              <p className="text-sm text-amber-800">
                You can see basic alumni cards right now. Complete your profile and get approved to unlock full alumni details and public contact information.
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

      <Card className="mb-8 rounded-3xl border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  name="search"
                  defaultValue={search}
                  placeholder="Search by name, city, profession, organization..."
                  className="pl-9"
                />
              </div>
            </div>

            <select
              name="year"
              defaultValue={yearFilter}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  Class of {year}
                </option>
              ))}
            </select>

            <select
              name="district"
              defaultValue={districtFilter}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              name="industry"
              defaultValue={industryFilter}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Apply
              </button>
              <Link
                href="/directory"
                className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
        <Users className="h-4 w-4" />
        {profiles.length} alumni found
      </div>

      {profiles.length === 0 ? (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No alumni found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters or search keywords.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const memberUrl = `/directory/${profile.slug || profile.id}`;

            return (
              <Link key={profile.id} href={memberUrl} className="group block">
                <Card className="h-full rounded-3xl border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                        {getAvatarFallback(profile)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-slate-900 group-hover:text-slate-700">
                            {profile.full_name}
                          </h3>

                          {viewerHasFullAccess ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              Full details
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Basic view</Badge>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                          {profile.graduation_year && (
                            <span className="inline-flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              Class of {profile.graduation_year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-slate-700">
                      {profile.current_position && (
                        <div className="flex items-start gap-2">
                          <Briefcase className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>{profile.current_position}</span>
                        </div>
                      )}

                      {viewerHasFullAccess && profile.current_organization && (
                        <div className="flex items-start gap-2">
                          <Building className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>{profile.current_organization}</span>
                        </div>
                      )}

                      {(profile.current_city || profile.current_country) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>
                            {profile.current_city || "Unknown city"}
                            {profile.current_country ? `, ${profile.current_country}` : ""}
                          </span>
                        </div>
                      )}

                      {profile.home_district && (
                        <div className="flex items-start gap-2">
                          <UserCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>Home District: {profile.home_district}</span>
                        </div>
                      )}
                    </div>

                    {viewerHasFullAccess && profile.bio && (
                      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        “{profile.bio}”
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
                      {viewerHasFullAccess ? (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Open full alumni profile
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Open limited preview
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}