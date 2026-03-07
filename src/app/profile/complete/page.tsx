"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  calculateProfileScore,
  getAccessLevelFromProfile,
  getLegacyVerificationStatus,
  isProfileComplete,
} from "@/lib/utils/verification";
import { slugifyProfileName } from "@/lib/utils/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  Globe,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserCircle2,
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

  show_phone_publicly: boolean;
  show_email_publicly: boolean;
  show_linkedin_publicly: boolean;
  show_in_directory: boolean;

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

  show_phone_publicly: false,
  show_email_publicly: false,
  show_linkedin_publicly: true,
  show_in_directory: true,

  verification_answers: {
    houses: "",
    teachers: "",
    staff: "",
    principal: "",
    established_year: "",
  },
};

export default function CompleteProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [existingAdminStatus, setExistingAdminStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [existingAccessLevel, setExistingAccessLevel] = useState<"limited" | "full">("limited");

  const [formData, setFormData] = useState<FormDataType>(emptyForm);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

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
        setExistingAdminStatus(profile.admin_status || "pending");
        setExistingAccessLevel(profile.access_level || "limited");

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

          featured_in_presentation: Boolean(profile.featured_in_presentation),
          available_for_mentoring: Boolean(profile.available_for_mentoring),

          show_phone_publicly: Boolean(profile.show_phone_publicly),
          show_email_publicly: Boolean(profile.show_email_publicly),
          show_linkedin_publicly:
            profile.show_linkedin_publicly === null || profile.show_linkedin_publicly === undefined
              ? true
              : Boolean(profile.show_linkedin_publicly),
          show_in_directory:
            profile.show_in_directory === null || profile.show_in_directory === undefined
              ? true
              : Boolean(profile.show_in_directory),

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
        ? prev.languages.filter((item) => item !== language)
        : [...prev.languages, language],
    }));
  };

  const score = useMemo(() => calculateProfileScore(formData), [formData]);
  const computedAccessLevel = useMemo(() => getAccessLevelFromProfile(formData), [formData]);
  const profileComplete = useMemo(() => isProfileComplete(formData), [formData]);

  const effectiveAdminStatusText =
    existingAdminStatus === "approved"
      ? "Approved"
      : existingAdminStatus === "rejected"
      ? "Rejected"
      : "Pending review";

  const accessText = computedAccessLevel === "full" ? "Ready for full access" : "Limited access";

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    setBanner(null);

    try {
      const computedSlug = slugifyProfileName(
        formData.full_name || user.email || "member",
        formData.graduation_year ? parseInt(formData.graduation_year) : null
      );

      const nextAdminStatus =
        existingAdminStatus === "approved" ? "approved" : "pending";

      const nextAccessLevel = computedAccessLevel;

      const payload = {
        id: user.id,
        email: user.email,

        full_name: formData.full_name || null,
        slug: computedSlug,

        entry_year: formData.entry_year ? parseInt(formData.entry_year) : null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
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
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        employment_status: formData.employment_status || null,

        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        languages: formData.languages,
        bio: formData.bio || null,
        achievements: formData.achievements || null,

        featured_in_presentation: formData.featured_in_presentation,
        available_for_mentoring: formData.available_for_mentoring,

        show_phone_publicly: formData.show_phone_publicly,
        show_email_publicly: formData.show_email_publicly,
        show_linkedin_publicly: formData.show_linkedin_publicly,
        show_in_directory: formData.show_in_directory,

        verification_answers: formData.verification_answers,
        verification_score: score,
        verification_status: getLegacyVerificationStatus(nextAccessLevel, nextAdminStatus),
        access_level: nextAccessLevel,
        admin_status: nextAdminStatus,
        is_profile_complete: profileComplete,
        submitted_for_review: nextAdminStatus !== "approved",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) throw error;

      setExistingAdminStatus(nextAdminStatus);
      setExistingAccessLevel(nextAccessLevel);

      setBanner({
        type: "success",
        text:
          nextAdminStatus === "approved"
            ? "Profile saved successfully. Your approval remains active."
            : "Profile saved successfully. Your profile is ready for admin review.",
      });

      router.refresh();
      setTimeout(() => {
        router.push("/profile/me");
      }, 900);
    } catch (err: any) {
      setBanner({
        type: "error",
        text: err.message || "Unable to save your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (bootLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-0 shadow-md">
          <CardContent className="p-10 text-center text-slate-500">
            Loading your profile...
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressWidth = `${Math.min(score, 100)}%`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Member profile and privacy settings
            </div>
            <h1 className="text-3xl font-bold">Complete or edit your profile</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Add your BRC background, professional details, and choose what contact information other alumni can see.
            </p>
          </div>

          <div className="grid gap-3 md:min-w-[240px]">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <div className="text-slate-300">Admin status</div>
              <div className="mt-1 font-semibold">{effectiveAdminStatusText}</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <div className="text-slate-300">Access preview</div>
              <div className="mt-1 font-semibold">{accessText}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Profile strength</span>
            <span className="font-semibold">{score}/100</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
            {profileComplete ? (
              <>
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                <span>Your profile has enough detail to be review-ready.</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-300" />
                <span>Complete the important fields to move beyond limited access.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : banner.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      <Card className="rounded-3xl border-0 shadow-md">
        <CardHeader>
          <CardTitle>Step {step} of 4</CardTitle>
          <CardDescription>
            {step === 1 && "BRC and batch details"}
            {step === 2 && "Professional and personal details"}
            {step === 3 && "Privacy and visibility controls"}
            {step === 4 && "Verification and community extras"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Full name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="As per BRC records"
                />
              </div>

              <div>
                <Label>Roll number</Label>
                <Input
                  value={formData.roll_number}
                  onChange={(e) => setField("roll_number", e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Entry year *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.entry_year}
                  onChange={(e) => setField("entry_year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 1980 + i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Graduation year *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.graduation_year}
                  onChange={(e) => setField("graduation_year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 1984 + i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Student type *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.student_type}
                  onChange={(e) => setField("student_type", e.target.value)}
                >
                  <option value="">Select student type</option>
                  {studentTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Finance type</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.regular_self_finance}
                  onChange={(e) => setField("regular_self_finance", e.target.value)}
                >
                  <option value="">Select finance type</option>
                  {financeTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Home district *</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.home_district}
                  onChange={(e) => setField("home_district", e.target.value)}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Current city *</Label>
                <Input
                  value={formData.current_city}
                  onChange={(e) => setField("current_city", e.target.value)}
                  placeholder="Quetta, Karachi, Dubai..."
                />
              </div>

              <div>
                <Label>Current country</Label>
                <Input
                  value={formData.current_country}
                  onChange={(e) => setField("current_country", e.target.value)}
                />
              </div>

              <div>
                <Label>Current position / title *</Label>
                <Input
                  value={formData.current_position}
                  onChange={(e) => setField("current_position", e.target.value)}
                  placeholder="Doctor, engineer, entrepreneur..."
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
                <Label>Current organization</Label>
                <Input
                  value={formData.current_organization}
                  onChange={(e) => setField("current_organization", e.target.value)}
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
                <Label>Employment status</Label>
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={formData.employment_status}
                  onChange={(e) => setField("employment_status", e.target.value)}
                >
                  <option value="">Select employment status</option>
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
                  placeholder="e.g. 7"
                />
              </div>

              <div>
                <Label>Phone number</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+92..."
                />
              </div>

              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setField("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Tell other alumni about yourself"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Achievements</Label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setField("achievements", e.target.value)}
                  placeholder="Awards, publications, major milestones..."
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Languages</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {languagesList.map((language) => (
                    <label
                      key={language}
                      className="flex items-center gap-3 rounded-2xl border p-3 text-sm"
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
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                Choose how much contact information other verified alumni can see. Sensitive fields stay hidden unless you explicitly allow them.
              </div>

              <div className="grid gap-4">
                <label className="flex items-start gap-4 rounded-2xl border p-4">
                  <Checkbox
                    checked={formData.show_phone_publicly}
                    onCheckedChange={(checked) => setField("show_phone_publicly", Boolean(checked))}
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Phone className="h-4 w-4" />
                      Show phone publicly to verified alumni
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      If enabled, full-access verified alumni can see your phone number.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 rounded-2xl border p-4">
                  <Checkbox
                    checked={formData.show_email_publicly}
                    onCheckedChange={(checked) => setField("show_email_publicly", Boolean(checked))}
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Mail className="h-4 w-4" />
                      Show email publicly to verified alumni
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      If disabled, your email stays private except for your own account and admin workflows.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 rounded-2xl border p-4">
                  <Checkbox
                    checked={formData.show_linkedin_publicly}
                    onCheckedChange={(checked) => setField("show_linkedin_publicly", Boolean(checked))}
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Linkedin className="h-4 w-4" />
                      Show LinkedIn publicly to verified alumni
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Good for networking, mentorship, and professional connections.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 rounded-2xl border p-4">
                  <Checkbox
                    checked={formData.show_in_directory}
                    onCheckedChange={(checked) => setField("show_in_directory", Boolean(checked))}
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Eye className="h-4 w-4" />
                      Show my profile in directory
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Turn this off if you want an account but prefer not to appear in the alumni directory.
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <Lock className="h-4 w-4" />
                    Always hidden
                  </div>
                  <p className="text-sm text-slate-500">
                    Verification answers, admin review details, and internal profile metadata are never shown publicly.
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                    <Globe className="h-4 w-4" />
                    Directory visibility
                  </div>
                  <p className="text-sm text-slate-500">
                    Limited users will still only see safe teaser information. Private contact data remains protected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>House names or hostel references</Label>
                <Input
                  value={formData.verification_answers.houses}
                  onChange={(e) => setVerificationField("houses", e.target.value)}
                />
              </div>

              <div>
                <Label>Teachers you remember</Label>
                <Input
                  value={formData.verification_answers.teachers}
                  onChange={(e) => setVerificationField("teachers", e.target.value)}
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
                  onChange={(e) => setVerificationField("principal", e.target.value)}
                />
              </div>

              <div>
                <Label>College established year</Label>
                <Input
                  value={formData.verification_answers.established_year}
                  onChange={(e) => setVerificationField("established_year", e.target.value)}
                />
              </div>

              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-3 rounded-2xl border p-4 text-sm">
                  <Checkbox
                    checked={formData.available_for_mentoring}
                    onCheckedChange={(checked) =>
                      setField("available_for_mentoring", Boolean(checked))
                    }
                  />
                  <span>Available for mentoring</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border p-4 text-sm">
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
                  <UserCircle2 className="h-4 w-4" />
                  Review note
                </div>
                <p>
                  A strong profile plus alumni verification details helps move you from limited access to admin-approved full access.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Current saved level:{" "}
              <span className="font-semibold text-slate-700 capitalize">
                {existingAccessLevel}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((value) => value - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep((value) => value + 1)}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving profile..." : "Save profile"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}