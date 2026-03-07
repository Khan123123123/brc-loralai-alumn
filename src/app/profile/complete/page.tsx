"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  calculateProfileScore,
  getVerificationStatus,
} from "@/lib/utils/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Phone,
  Linkedin,
  Award,
  Building,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";

const districts = [
  "Loralai",
  "Qila Saifullah",
  "Zhob",
  "Barkhan",
  "Musakhel",
  "Duki",
  "Quetta",
  "Pishin",
  "Other",
];

const studentTypes = ["Hostelite", "Day Scholar"];
const financeTypes = ["Regular", "Self-Finance"];
const employmentStatuses = [
  "Employed",
  "Self-Employed",
  "Business Owner",
  "Student",
  "Retired",
  "Not Working",
  "House Wife/Husband",
];

const languagesList = [
  "Balochi",
  "Pashto",
  "Urdu",
  "English",
  "Punjabi",
  "Sindhi",
  "Brahvi",
  "Other",
];

const industries = [
  "Healthcare/Medical",
  "IT/Software/Technology",
  "Education/Teaching",
  "Government/Public Sector",
  "Business/Trade",
  "Banking/Finance",
  "Engineering",
  "Law/Legal",
  "Media/Journalism",
  "Agriculture",
  "Military/Defense",
  "Real Estate",
  "Transportation",
  "Construction",
  "Mining",
  "Other",
];

type FormDataType = {
  full_name: string;
  entry_year: string;
  graduation_year: string;
  home_district: string;
  student_type: string;
  regular_self_finance: string;
  roll_number: string;

  current_country: string;
  current_city: string;
  current_position: string;
  profession: string;
  current_organization: string;
  industry: string;
  experience_years: string;
  employment_status: string;
  phone: string;
  linkedin_url: string;
  languages: string[];
  bio: string;
  achievements: string;
  featured_in_presentation: boolean;
  available_for_mentoring: boolean;

  verification_answers: {
    houses: string;
    teachers: string;
    staff: string;
    principal: string;
    established_year: string;
  };
};

const emptyForm: FormDataType = {
  full_name: "",
  entry_year: "",
  graduation_year: "",
  home_district: "",
  student_type: "",
  regular_self_finance: "",
  roll_number: "",

  current_country: "Pakistan",
  current_city: "",
  current_position: "",
  profession: "",
  current_organization: "",
  industry: "",
  experience_years: "",
  employment_status: "",
  phone: "",
  linkedin_url: "",
  languages: [],
  bio: "",
  achievements: "",
  featured_in_presentation: false,
  available_for_mentoring: false,

  verification_answers: {
    houses: "",
    teachers: "",
    staff: "",
    principal: "",
    established_year: "",
  },
};

export default function CompleteProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>(emptyForm);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setExistingStatus(profile.verification_status || null);

        setFormData({
          full_name: profile.full_name || "",
          entry_year: profile.entry_year?.toString() || "",
          graduation_year: profile.graduation_year?.toString() || "",
          home_district: profile.home_district || "",
          student_type: profile.student_type || "",
          regular_self_finance: profile.regular_self_finance || "",
          roll_number: profile.roll_number || "",

          current_country: profile.current_country || "Pakistan",
          current_city: profile.current_city || "",
          current_position: profile.current_position || "",
          profession: profile.profession || "",
          current_organization: profile.current_organization || "",
          industry: profile.industry || "",
          experience_years: profile.experience_years?.toString() || "",
          employment_status: profile.employment_status || "",
          phone: profile.phone || "",
          linkedin_url: profile.linkedin_url || "",
          languages: profile.languages || [],
          bio: profile.bio || "",
          achievements: profile.achievements || "",
          featured_in_presentation: profile.featured_in_presentation || false,
          available_for_mentoring: profile.available_for_mentoring || false,

          verification_answers: {
            houses: profile.verification_answers?.houses || "",
            teachers: profile.verification_answers?.teachers || "",
            staff: profile.verification_answers?.staff || "",
            principal: profile.verification_answers?.principal || "",
            established_year: profile.verification_answers?.established_year || "",
          },
        });
      }

      setBootLoading(false);
    };

    load();
  }, [router, supabase]);

  const currentScore = useMemo(() => calculateProfileScore(formData), [formData]);
  const status = useMemo(() => getVerificationStatus(currentScore), [currentScore]);
  const isFullyVerified = status === "full";

  const setField = (field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setVerificationField = (
    field: keyof FormDataType["verification_answers"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      verification_answers: {
        ...prev.verification_answers,
        [field]: value,
      },
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const score = currentScore;
      const finalStatus = getVerificationStatus(score);

      const payload = {
        id: user.id,
        email: user.email,
        full_name: formData.full_name || null,
        entry_year: formData.entry_year ? parseInt(formData.entry_year) : null,
        graduation_year: formData.graduation_year
          ? parseInt(formData.graduation_year)
          : null,
        home_district: formData.home_district || null,
        student_type: formData.student_type || null,
        regular_self_finance: formData.regular_self_finance || null,
        roll_number: formData.roll_number || null,

        current_country: formData.current_country || "Pakistan",
        current_city: formData.current_city || null,
        current_position: formData.current_position || null,
        profession: formData.profession || null,
        current_organization: formData.current_organization || null,
        industry: formData.industry || null,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        employment_status: formData.employment_status || null,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        languages: formData.languages,
        bio: formData.bio || null,
        achievements: formData.achievements || null,
        featured_in_presentation: formData.featured_in_presentation,
        available_for_mentoring: formData.available_for_mentoring,

        verification_answers: formData.verification_answers,
        verification_score: score,
        verification_status: finalStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) throw error;

      if (finalStatus === "full") {
        alert("Profile saved successfully. You now have full access.");
        router.push("/profile/me");
      } else {
        alert(
          `Profile saved successfully. Your verification score is ${score}/100. Add more details to reach full access.`
        );
        router.push("/profile/me");
      }

      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-10 text-center text-slate-500">
            Loading profile...
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressWidth = `${Math.min(currentScore, 100)}%`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Complete or Edit Your Profile</h1>
            <p className="mt-2 text-slate-300">
              Build a strong alumni profile and unlock full access to the network.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <div className="text-slate-300">Current status</div>
            <div className="mt-1 font-semibold capitalize">
              {existingStatus || "new profile"}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Verification Score</span>
            <span className="font-semibold">{currentScore}/100</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            {isFullyVerified ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>Full access unlocked</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-300" />
                <span>{70 - currentScore} more points needed for full access</span>
              </>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-0 shadow-md">
        <CardHeader>
          <CardTitle>
            Step {step} of 3
          </CardTitle>
          <CardDescription>
            {step === 1 && "BRC details"}
            {step === 2 && "Professional details"}
            {step === 3 && "Verification and extras"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="As per BRC records"
                />
              </div>

              <div>
                <Label>Roll Number</Label>
                <Input
                  value={formData.roll_number}
                  onChange={(e) => setField("roll_number", e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Entry Year *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.entry_year}
                  onChange={(e) => setField("entry_year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 45 }, (_, i) => 1980 + i).map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Graduation Year *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.graduation_year}
                  onChange={(e) => setField("graduation_year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 45 }, (_, i) => 1984 + i).map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Student Type *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.student_type}
                  onChange={(e) => setField("student_type", e.target.value)}
                >
                  <option value="">Select type</option>
                  {studentTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Finance Type</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.regular_self_finance}
                  onChange={(e) =>
                    setField("regular_self_finance", e.target.value)
                  }
                >
                  <option value="">Select type</option>
                  {financeTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Home District *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.home_district}
                  onChange={(e) => setField("home_district", e.target.value)}
                >
                  <option value="">Select district</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Current City *</Label>
                <Input
                  value={formData.current_city}
                  onChange={(e) => setField("current_city", e.target.value)}
                  placeholder="Quetta, Karachi, Dubai..."
                />
              </div>

              <div>
                <Label>Current Country</Label>
                <Input
                  value={formData.current_country}
                  onChange={(e) => setField("current_country", e.target.value)}
                />
              </div>

              <div>
                <Label>Current Position / Job Title *</Label>
                <Input
                  value={formData.current_position}
                  onChange={(e) => setField("current_position", e.target.value)}
                  placeholder="Doctor, Engineer, Entrepreneur..."
                />
              </div>

              <div>
                <Label>Profession</Label>
                <Input
                  value={formData.profession}
                  onChange={(e) => setField("profession", e.target.value)}
                />
              </div>

              <div>
                <Label>Current Organization</Label>
                <Input
                  value={formData.current_organization}
                  onChange={(e) =>
                    setField("current_organization", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Industry</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.industry}
                  onChange={(e) => setField("industry", e.target.value)}
                >
                  <option value="">Select industry</option>
                  {industries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Employment Status</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.employment_status}
                  onChange={(e) => setField("employment_status", e.target.value)}
                >
                  <option value="">Select status</option>
                  {employmentStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Experience (years)</Label>
                <Input
                  value={formData.experience_years}
                  onChange={(e) => setField("experience_years", e.target.value)}
                />
              </div>

              <div>
                <Label>
                  <Phone className="mr-2 inline h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+92..."
                />
              </div>

              <div>
                <Label>
                  <Linkedin className="mr-2 inline h-4 w-4" />
                  LinkedIn URL
                </Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setField("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="md:col-span-2">
                <Label>
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Bio
                </Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Tell fellow Koharians about yourself"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <Label>
                  <Award className="mr-2 inline h-4 w-4" />
                  Achievements
                </Label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setField("achievements", e.target.value)}
                  placeholder="Awards, milestones, publications, achievements..."
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Languages</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {languagesList.map((language) => (
                    <label
                      key={language}
                      className="flex items-center gap-3 rounded-xl border p-3 text-sm"
                    >
                      <Checkbox
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <span>{language}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>House names or hostel references</Label>
                <Input
                  value={formData.verification_answers.houses}
                  onChange={(e) =>
                    setVerificationField("houses", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Teachers you remember</Label>
                <Input
                  value={formData.verification_answers.teachers}
                  onChange={(e) =>
                    setVerificationField("teachers", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Staff members you remember</Label>
                <Input
                  value={formData.verification_answers.staff}
                  onChange={(e) => setVerificationField("staff", e.target.value)}
                />
              </div>

              <div>
                <Label>Principal name you remember</Label>
                <Input
                  value={formData.verification_answers.principal}
                  onChange={(e) =>
                    setVerificationField("principal", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>College established year</Label>
                <Input
                  value={formData.verification_answers.established_year}
                  onChange={(e) =>
                    setVerificationField("established_year", e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-3 rounded-xl border p-4 text-sm">
                  <Checkbox
                    checked={formData.available_for_mentoring}
                    onCheckedChange={(checked) =>
                      setField("available_for_mentoring", Boolean(checked))
                    }
                  />
                  <span>Available for mentoring</span>
                </label>

                <label className="flex items-center gap-3 rounded-xl border p-4 text-sm">
                  <Checkbox
                    checked={formData.featured_in_presentation}
                    onCheckedChange={(checked) =>
                      setField("featured_in_presentation", Boolean(checked))
                    }
                  />
                  <span>Allow featuring in alumni presentations</span>
                </label>
              </div>

              <div className="md:col-span-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <Building className="h-4 w-4" />
                  Verification Summary
                </div>
                <p>
                  Richer profile details and stronger BRC verification answers improve your score and access level.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Status after save:{" "}
              <span className="font-semibold capitalize text-slate-700">
                {status}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}