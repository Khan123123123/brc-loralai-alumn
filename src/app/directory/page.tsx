import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Briefcase,
  Phone,
  Linkedin,
  Building,
  Globe,
  GraduationCap,
  UserCircle2,
  Sparkles,
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

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("verification_status, full_name")
    .eq("id", user.id)
    .single();

  if (currentUserProfile?.verification_status !== "full") {
    redirect("/profile/complete");
  }

  const search = (searchParams.search as string) || "";
  const yearFilter = (searchParams.year as string) || "all";
  const districtFilter = (searchParams.district as string) || "all";
  const industryFilter = (searchParams.industry as string) || "all";

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("verification_status", "full")
    .order("graduation_year", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,profession.ilike.%${search}%,current_city.ilike.%${search}%,current_position.ilike.%${search}%,current_organization.ilike.%${search}%`
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

  const { data: profiles } = await query;

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("graduation_year, home_district, industry")
    .eq("verification_status", "full");

  const years = Array.from(
    new Set((allProfiles || []).map((p) => p.graduation_year).filter(Boolean))
  ).sort((a: any, b: any) => b - a);

  const districts = Array.from(
    new Set((allProfiles || []).map((p) => p.home_district).filter(Boolean))
  ).sort();

  const industries = Array.from(
    new Set((allProfiles || []).map((p) => p.industry).filter(Boolean))
  ).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            <Sparkles className="h-4 w-4" />
            Verified Alumni Network
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Alumni Directory
          </h1>
          <p className="mt-2 text-slate-600">
            Browse and reconnect with verified Koharians across batches, cities, and professions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile/me"
            className="inline-flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            My Profile
          </Link>
          <Link
            href="/profile/complete"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <Card className="mb-8 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
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

      <div className="mb-5 text-sm text-slate-500">
        {profiles?.length || 0} verified alumni found
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No verified alumni found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or removing filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                    {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-slate-900">
                        {profile.full_name}
                      </h3>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Verified
                      </Badge>
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

                  {profile.current_organization && (
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

                  {profile.industry && (
                    <div className="flex items-start gap-2">
                      <Globe className="mt-0.5 h-4 w-4 text-slate-400" />
                      <span>{profile.industry}</span>
                    </div>
                  )}

                  {profile.home_district && (
                    <div className="flex items-start gap-2">
                      <UserCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />
                      <span>Home District: {profile.home_district}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    “{profile.bio}”
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.available_for_mentoring && (
                    <Badge variant="secondary">Available for mentoring</Badge>
                  )}
                  {profile.featured_in_presentation && (
                    <Badge variant="secondary">Featured alumni</Badge>
                  )}
                  {profile.student_type && (
                    <Badge variant="outline">{profile.student_type}</Badge>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}

                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}