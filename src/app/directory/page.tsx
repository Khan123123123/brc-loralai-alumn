import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, GraduationCap, MapPin, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  
  let query = supabase
    .from("profiles")
    .select("*")
    .in("verification_status", ["basic", "full"])
    .order("graduation_year", { ascending: false });

  const search = searchParams.search as string;
  const yearFilter = searchParams.year as string;
  const programFilter = searchParams.program as string;
  const industryFilter = searchParams.industry as string;

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,profession.ilike.%${search}%,current_city.ilike.%${search}%,current_position.ilike.%${search}%`
    );
  }

  if (yearFilter && yearFilter !== "all") {
    query = query.eq("graduation_year", parseInt(yearFilter));
  }

  if (programFilter && programFilter !== "all") {
    query = query.eq("program", programFilter);
  }

  if (industryFilter && industryFilter !== "all") {
    query = query.eq("industry", industryFilter);
  }

  const { data: profiles } = await query;

  // Get unique values using filter instead of Set
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("graduation_year, program, industry")
    .in("verification_status", ["basic", "full"]);

  // Get unique values manually
  const years: number[] = [];
  const programs: string[] = [];
  const industries: string[] = [];

  allProfiles?.forEach((p) => {
    if (p.graduation_year && !years.includes(p.graduation_year)) {
      years.push(p.graduation_year);
    }
    if (p.program && !programs.includes(p.program)) {
      programs.push(p.program);
    }
    if (p.industry && !industries.includes(p.industry)) {
      industries.push(p.industry);
    }
  });

  years.sort((a, b) => b - a);
  programs.sort();
  industries.sort();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
          <p className="text-gray-600">
            Connect with {profiles?.length || 0}+ verified Koharians
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <form className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  name="search"
                  placeholder="Search by name, profession, city..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>

              <Select name="year" defaultValue={yearFilter || "all"}>
                <SelectTrigger className="w-[180px]">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Class Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Class of {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select name="program" defaultValue={programFilter || "all"}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select name="industry" defaultValue={industryFilter || "all"}>
                <SelectTrigger className="w-[180px]">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
              {(search || yearFilter || programFilter || industryFilter) && (
                <a
                  href="/directory"
                  className="ml-2 text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Clear All
                </a>
              )}
            </div>
          </form>
        </div>

        {!profiles || profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No alumni found matching your criteria.</p>
            <a href="/directory" className="text-blue-600 hover:underline mt-2 inline-block">
              View all alumni
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {profile.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {profile.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Class of {profile.graduation_year}
                        </p>
                      </div>
                    </div>
                    {profile.verification_status === "full" && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Program:</span> {profile.program}
                    </p>
                    {profile.profession && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Profession:</span> {profile.profession}
                      </p>
                    )}
                    {profile.current_position && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Position:</span> {profile.current_position}
                      </p>
                    )}
                    {profile.current_city && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {profile.current_city}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.industry && (
                      <Badge variant="secondary">{profile.industry}</Badge>
                    )}
                    {profile.available_for_mentoring && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Mentor
                      </Badge>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {profile.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}