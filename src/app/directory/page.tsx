import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, GraduationCap, MapPin, Briefcase, 
  Phone, Linkedin, Award, BookOpen, User, 
  Building, Globe, CheckCircle 
} from "lucide-react";
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
  
  // Check if user is logged in and verified
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // Check if user has full access
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();
    
  if (currentUserProfile?.verification_status !== 'full') {
    redirect("/profile/complete");
  }

  // Build query - ONLY show full verified users
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("verification_status", "full")  // Only full, no basic
    .order("graduation_year", { ascending: false });

  const search = searchParams.search as string;
  const yearFilter = searchParams.year as string;
  const districtFilter = searchParams.district as string;
  const industryFilter = searchParams.industry as string;

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,profession.ilike.%${search}%,current_city.ilike.%${search}%,current_position.ilike.%${search}%,current_organization.ilike.%${search}%`
    );
  }

  if (yearFilter && yearFilter !== "all") {
    query = query.eq("graduation_year", parseInt(yearFilter));
  }

  if (districtFilter && districtFilter !== "all") {
    query = query.eq("home_district", districtFilter);
  }

  if (industryFilter && industryFilter !== "all") {
    query = query.eq("industry", industryFilter);
  }

  const { data: profiles } = await query;

  // Get filter options
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("graduation_year, home_district, industry")
    .eq("verification_status", "full");

  const years = Array.from(new Set((allProfiles || []).map((p) => p.graduation_year).filter(Boolean)))
    .sort((a: any, b: any) => b - a);
  const districts = Array.from(new Set((allProfiles || []).map((p) => p.home_district).filter(Boolean))).sort();
  const industries = Array.from(new Set((allProfiles || []).map((p) => p.industry).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">BRC Loralai Alumni Directory</h1>
          <p className="text-gray-600 text-lg">
            {profiles?.length || 0}+ Verified Koharians
          </p>
          <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" /> Full Access
          </Badge>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  name="search"
                  placeholder="Search alumni..."
                  defaultValue={search}
                  className="pl-10 h-12"
                />
              </div>

              <Select name="year" defaultValue={yearFilter || "all"}>
                <SelectTrigger className="h-12">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  <SelectValue placeholder="Class Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>Class of {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select name="district" defaultValue={districtFilter || "all"}>
                <SelectTrigger className="h-12">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  <SelectValue placeholder="Home District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select name="industry" defaultValue={industryFilter || "all"}>
                <SelectTrigger className="h-12">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Apply Filters
              </button>
              {(search || yearFilter || districtFilter || industryFilter) && (
                <a href="/directory" className="text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-lg">
                  Clear
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {!profiles || profiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-xl">No verified alumni found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-2xl transition-all border-2 hover:border-blue-200">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {profile.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{profile.full_name}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>Class of {profile.graduation_year}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-4">
                  {/* Professional Info */}
                  <div className="space-y-2">
                    {profile.current_position && (
                      <div className="flex items-center gap-2 text-gray-800 font-medium">
                        {profile.current_position}
                      </div>
                    )}
                    
                    {profile.current_organization && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span>{profile.current_organization}</span>
                      </div>
                    )}
                    
                    {profile.industry && (
                      <Badge variant="secondary" className="text-xs">{profile.industry}</Badge>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{profile.current_city}{profile.current_country && `, ${profile.current_country}`}</span>
                    </div>
                  </div>

                  {/* BRC Background */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <div className="text-gray-700"><strong>Home District:</strong> {profile.home_district || 'N/A'}</div>
                    <div className="text-gray-700"><strong>Student Type:</strong> {profile.student_type || 'N/A'}</div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="text-sm text-gray-600 italic border-l-4 border-blue-300 pl-3">
                      "{profile.bio}"
                    </div>
                  )}

                  {/* Contact */}
                  <div className="pt-3 border-t space-y-2">
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Linkedin className="w-4 h-4" /> LinkedIn →
                      </a>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.available_for_mentoring && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Mentor ✓</Badge>
                    )}
                    {profile.featured_in_presentation && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Featured</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}