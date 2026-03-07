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
import { Education, Job } from "@/types/database";
import { deleteMyAccount } from "@/app/profile/actions";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  UserCircle2,
  Lock,
  Settings,
  AlertTriangle
} from "lucide-react";

const districts = [
  "Awaran", "Barkhan", "Chagai", "Chaman", "Dera Bugti", "Duki", 
  "Gwadar", "Harnai", "Hub", "Jafarabad", "Jhal Magsi", "Kachhi (Bolan)", 
  "Kalat", "Kech (Turbat)", "Kharan", "Khuzdar", "Killa Abdullah", 
  "Killa Saifullah", "Kohlu", "Lasbela", "Loralai", "Mastung", 
  "Musakhel", "Naseerabad", "Nushki", "Panjgur", "Pishin", "Quetta", 
  "Sherani", "Sibi", "Sohbatpur", "Surab", "Usta Muhammad", "Washuk", 
  "Zhob", "Ziarat", "Other",
];

const studentTypes = ["Hostelite", "Day Scholar"];
const financeTypes = ["Regular", "Self-Finance"];
const employmentStatuses = [
  "Employed", "Self-Employed", "Business Owner", "Student", 
  "Retired", "Not Working", "House Wife/Husband",
];

const languagesList = [
  "Balochi", "Pashto", "Urdu", "English", "Punjabi", "Sindhi", "Brahvi", "Other",
];

const industries = [
  "Healthcare/Medical", "IT/Software/Technology", "Education/Teaching", 
  "Government/Public Sector", "Business/Trade", "Banking/Finance", 
  "Engineering", "Law/Legal", "Media/Journalism", "Agriculture", 
  "Military/Defense", "Real Estate", "Transportation", "Construction", 
  "Mining", "Other",
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

  higher_education: Education[];
  job_history: Job[];

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
  full_name: "", entry_year: "", graduation_year: "", home_district: "", 
  student_type: "", regular_self_finance: "", roll_number: "",
  current_country: "Pakistan", current_city: "", current_position: "", 
  profession: "", current_organization: "", industry: "", experience_years: "", 
  employment_status: "",
  higher_education: [], job_history: [],
  phone: "", linkedin_url: "", languages: [], bio: "", achievements: "",
  featured_in_presentation: false, available_for_mentoring: false,
  
  show_phone_publicly: true, 
  show_email_publicly: true, 
  show_linkedin_publicly: true, 
  show_in_directory: true,
  
  verification_answers: { houses: "", teachers: "", staff: "", principal: "", established_year: "" },
};

export default function CompleteProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  
  // Track if they have ever been fully approved, handling both old and new database states
  const [isAlreadyApproved, setIsAlreadyApproved] = useState(false);
  
  const [formData, setFormData] = useState<FormDataType>(emptyForm);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Auth/Account Settings State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (profile) {
        // Robust check: Look at ALL indicators of approval to catch legacy accounts
        const approved = profile.admin_status === "approved" || profile.verification_status === "full" || profile.access_level === "full";
        setIsAlreadyApproved(approved);

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

          higher_education: profile.higher_education || [],
          job_history: profile.job_history || [],

          phone: profile.phone || "",
          linkedin_url: profile.linkedin_url || "",
          languages: profile.languages || [],
          bio: profile.bio || "",
          achievements: profile.achievements || "",

          featured_in_presentation: Boolean(profile.featured_in_presentation),
          available_for_mentoring: Boolean(profile.available_for_mentoring),

          show_phone_publicly: profile.show_phone_publicly === null ? true : Boolean(profile.show_phone_publicly),
          show_email_publicly: true,
          show_linkedin_publicly: true,
          show_in_directory: true,

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

  const setVerificationField = (field: keyof FormDataType["verification_answers"], value: string) => {
    setFormData((prev) => ({
      ...prev, verification_answers: { ...prev.verification_answers, [field]: value },
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev, higher_education: [...prev.higher_education, { institution: "", degree: "", field: "", start_date: "", end_date: "" }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...formData.higher_education];
    updated[index] = { ...updated[index], [field]: value };
    setField("higher_education", updated);
  };

  const removeEducation = (index: number) => {
    const updated = [...formData.higher_education];
    updated.splice(index, 1);
    setField("higher_education", updated);
  };

  const addJob = () => {
    setFormData((prev) => ({
      ...prev, job_history: [...prev.job_history, { company: "", title: "", start_date: "", end_date: "", is_current: false }]
    }));
  };

  const updateJob = (index: number, field: keyof Job, value: string | boolean) => {
    const updated = [...formData.job_history];
    updated[index] = { ...updated[index], [field]: value };
    setField("job_history", updated);
  };

  const removeJob = (index: number) => {
    const updated = [...formData.job_history];
    updated.splice(index, 1);
    setField("job_history", updated);
  };

  const score = useMemo(() => calculateProfileScore(formData), [formData]);
  const computedAccessLevel = useMemo(() => getAccessLevelFromProfile(formData), [formData]);
  const profileComplete = useMemo(() => isProfileComplete(formData), [formData]);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setBanner(null);

    try {
      const computedSlug = slugifyProfileName(formData.full_name || user.email || "member", formData.graduation_year ? parseInt(formData.graduation_year) : null);
      
      // EXPLICIT LOCK: If they are already approved, force all status markers to stay approved.
      const nextAdminStatus = isAlreadyApproved ? "approved" : "pending";
      const nextAccessLevel = isAlreadyApproved ? "full" : computedAccessLevel;
      const nextVerificationStatus = isAlreadyApproved ? "full" : getLegacyVerificationStatus(nextAccessLevel, nextAdminStatus);

      const payload = {
        id: user.id, email: user.email, full_name: formData.full_name || null, slug: computedSlug,
        entry_year: formData.entry_year ? parseInt(formData.entry_year) : null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        home_district: formData.home_district || null, student_type: formData.student_type || null,
        regular_self_finance: formData.regular_self_finance || null, roll_number: formData.roll_number || null,
        current_country: formData.current_country || "Pakistan", current_city: formData.current_city || null,
        current_position: formData.current_position || null, profession: formData.profession || null,
        current_organization: formData.current_organization || null, industry: formData.industry || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        employment_status: formData.employment_status || null,
        higher_education: formData.higher_education, job_history: formData.job_history,
        phone: formData.phone || null, linkedin_url: formData.linkedin_url || null,
        languages: formData.languages, bio: formData.bio || null, achievements: formData.achievements || null,
        featured_in_presentation: formData.featured_in_presentation, available_for_mentoring: formData.available_for_mentoring,
        
        show_phone_publicly: formData.show_phone_publicly, 
        show_email_publicly: true,
        show_linkedin_publicly: true, 
        show_in_directory: true,
        
        verification_answers: formData.verification_answers, verification_score: score,
        verification_status: nextVerificationStatus,
        access_level: nextAccessLevel, admin_status: nextAdminStatus,
        is_profile_complete: profileComplete, 
        submitted_for_review: !isAlreadyApproved, // Only mark for review if NOT approved yet
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;

      setBanner({ type: "success", text: "Profile saved successfully." });
      router.refresh();
      setTimeout(() => router.push("/profile/me"), 900);
    } catch (err: any) {
      setBanner({ type: "error", text: err.message || "Unable to save your profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAuth = async (type: "email" | "password") => {
    if (!confirm(`Are you sure you want to change your ${type}?`)) return;
    
    setAuthLoading(true);
    try {
      let updateData = {};
      if (type === "email" && newEmail) updateData = { email: newEmail };
      if (type === "password" && newPassword) updateData = { password: newPassword };
      
      const { error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;
      
      alert(`Your ${type} has been successfully updated. ${type === 'email' ? 'Please check your new email inbox for a confirmation link.' : ''}`);
      if (type === "email") setNewEmail("");
      if (type === "password") setNewPassword("");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("DANGER: This action is permanent and cannot be undone. Are you absolutely sure you want to delete your BRC Loralai Alumni account?")) return;
    
    setAuthLoading(true);
    try {
      await deleteMyAccount();
      window.location.href = "/auth/login";
    } catch (e: any) {
      alert("Error deleting account: " + e.message);
      setAuthLoading(false);
    }
  };

  if (bootLoading) {
    return <div className="text-center p-10 mt-20 text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-primary p-8 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <ShieldCheck className="h-4 w-4" /> Member Profile
            </div>
            <h1 className="text-3xl font-bold">Edit your profile</h1>
          </div>
          <div className="grid gap-3 min-w-[200px]">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <div className="text-slate-300">Account Status</div>
              <div className="mt-1 font-semibold flex items-center gap-2 capitalize">
                {isAlreadyApproved && <Lock className="w-4 h-4 text-emerald-400" />}
                {isAlreadyApproved ? "Approved (Full Access)" : "Pending / Limited"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {banner && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {banner.text}
        </div>
      )}

      <Card className="rounded-3xl border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle>Step {step} of 4</CardTitle>
          <CardDescription>
            {step === 1 && "BRC and batch details"}
            {step === 2 && "Education and Experience"}
            {step === 3 && "Contact Details & Bio"}
            {step === 4 && "Verification Questions (Admin Only)"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                {isAlreadyApproved && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-200 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 
                    Your account is approved. Core identity fields (Name and Years) are now locked to maintain integrity.
                  </div>
                )}
              </div>
              <div>
                <Label>Full name *</Label>
                <Input 
                  value={formData.full_name} 
                  onChange={(e) => setField("full_name", e.target.value)} 
                  disabled={isAlreadyApproved}
                  className={isAlreadyApproved ? "bg-slate-100" : ""}
                />
              </div>
              <div>
                <Label>Roll number</Label>
                <Input value={formData.roll_number} onChange={(e) => setField("roll_number", e.target.value)} />
              </div>
              <div>
                <Label>Entry year *</Label>
                <select 
                  className={`mt-2 h-10 w-full rounded-md border px-3 text-sm ${isAlreadyApproved ? "bg-slate-100 opacity-70 pointer-events-none" : ""}`} 
                  value={formData.entry_year} 
                  onChange={(e) => setField("entry_year", e.target.value)}
                  disabled={isAlreadyApproved}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 1980 + i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <Label>Graduation year *</Label>
                <select 
                  className={`mt-2 h-10 w-full rounded-md border px-3 text-sm ${isAlreadyApproved ? "bg-slate-100 opacity-70 pointer-events-none" : ""}`} 
                  value={formData.graduation_year} 
                  onChange={(e) => setField("graduation_year", e.target.value)}
                  disabled={isAlreadyApproved}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 1984 + i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <Label>Student type</Label>
                <select className="mt-2 h-10 w-full rounded-md border px-3 text-sm" value={formData.student_type} onChange={(e) => setField("student_type", e.target.value)}>
                  <option value="">Select</option>
                  {studentTypes.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>Home district *</Label>
                <select className="mt-2 h-10 w-full rounded-md border px-3 text-sm" value={formData.home_district} onChange={(e) => setField("home_district", e.target.value)}>
                  <option value="">Select</option>
                  {districts.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div><Label>Current Position / Title *</Label><Input value={formData.current_position} onChange={(e) => setField("current_position", e.target.value)} placeholder="e.g. Senior Engineer" /></div>
                <div><Label>Current Organization</Label><Input value={formData.current_organization} onChange={(e) => setField("current_organization", e.target.value)} placeholder="e.g. Google" /></div>
                <div>
                  <Label>Industry</Label>
                  <select className="mt-2 h-10 w-full rounded-md border px-3 text-sm" value={formData.industry} onChange={(e) => setField("industry", e.target.value)}>
                    <option value="">Select</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input type="number" value={formData.experience_years} onChange={(e) => setField("experience_years", e.target.value)} />
                </div>
              </div>

              {/* Higher Education Block */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">Higher Education</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEducation}><Plus className="w-4 h-4 mr-1"/> Add Education</Button>
                </div>
                <div className="space-y-4">
                  {formData.higher_education.map((edu, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-xl relative border border-slate-200">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50" onClick={() => removeEducation(index)}><Trash2 className="w-4 h-4"/></Button>
                      <div><Label>Institution</Label><Input value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="University Name" /></div>
                      <div><Label>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="e.g. BS, MS, PhD" /></div>
                      <div><Label>Field of Study</Label><Input value={edu.field} onChange={(e) => updateEducation(index, "field", e.target.value)} placeholder="e.g. Computer Science" /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>From</Label><Input type="number" placeholder="YYYY" value={edu.start_date} onChange={(e) => updateEducation(index, "start_date", e.target.value)} /></div>
                        <div><Label>To</Label><Input type="number" placeholder="YYYY" value={edu.end_date} onChange={(e) => updateEducation(index, "end_date", e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  {formData.higher_education.length === 0 && <p className="text-sm text-slate-500 italic">No higher education added yet.</p>}
                </div>
              </div>

              {/* Job History Block */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">Job History</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addJob}><Plus className="w-4 h-4 mr-1"/> Add Job</Button>
                </div>
                <div className="space-y-4">
                  {formData.job_history.map((job, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-xl relative border border-slate-200">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50" onClick={() => removeJob(index)}><Trash2 className="w-4 h-4"/></Button>
                      <div><Label>Company</Label><Input value={job.company} onChange={(e) => updateJob(index, "company", e.target.value)} placeholder="Company Name" /></div>
                      <div><Label>Title</Label><Input value={job.title} onChange={(e) => updateJob(index, "title", e.target.value)} placeholder="Job Title" /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>From</Label><Input type="number" placeholder="YYYY" value={job.start_date} onChange={(e) => updateJob(index, "start_date", e.target.value)} /></div>
                        <div><Label>To</Label><Input type="number" placeholder="YYYY" value={job.end_date} onChange={(e) => updateJob(index, "end_date", e.target.value)} disabled={job.is_current} /></div>
                      </div>
                      <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox checked={job.is_current} onCheckedChange={(c) => updateJob(index, "is_current", Boolean(c))} />
                          I currently work here
                        </label>
                      </div>
                    </div>
                  ))}
                  {formData.job_history.length === 0 && <p className="text-sm text-slate-500 italic">No job history added yet.</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div><Label>Current City *</Label><Input value={formData.current_city} onChange={(e) => setField("current_city", e.target.value)} /></div>
              <div><Label>Current Country</Label><Input value={formData.current_country} onChange={(e) => setField("current_country", e.target.value)} /></div>

              {/* Only Phone has Privacy Toggle */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                <Label>Phone Number</Label>
                <Input className="mt-2 bg-white max-w-md" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+92..." />
                <label className="flex items-center gap-2 mt-3 text-sm text-slate-600 cursor-pointer">
                  <Checkbox checked={!formData.show_phone_publicly} onCheckedChange={(c) => setField("show_phone_publicly", !c)} />
                  Do not show my phone number to other alumni
                </label>
              </div>

              <div>
                <Label>LinkedIn URL</Label>
                <Input className="mt-2 bg-white" value={formData.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="md:col-span-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setField("bio", e.target.value)} rows={3} /></div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
                <ShieldCheck className="w-5 h-5 inline mr-2" />
                These answers are completely private and only visible to the site administrators to verify your alumni status.
              </div>
              <div><Label>House names or hostel references</Label><Input value={formData.verification_answers.houses} onChange={(e) => setVerificationField("houses", e.target.value)} /></div>
              <div><Label>Teachers you remember</Label><Input value={formData.verification_answers.teachers} onChange={(e) => setVerificationField("teachers", e.target.value)} /></div>
              <div><Label>Staff/Guards (e.g. Ghulam Nabi etc)</Label><Input value={formData.verification_answers.staff} onChange={(e) => setVerificationField("staff", e.target.value)} /></div>
              <div><Label>Principal name you remember</Label><Input value={formData.verification_answers.principal} onChange={(e) => setVerificationField("principal", e.target.value)} /></div>
              <div><Label>College established year</Label><Input value={formData.verification_answers.established_year} onChange={(e) => setVerificationField("established_year", e.target.value)} /></div>
            </div>
          )}

          <div className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={() => setStep((v) => Math.max(1, v - 1))} disabled={step === 1}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>
            {step < 4 ? (
              <Button type="button" onClick={() => setStep((v) => v + 1)}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-white"><Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Profile"}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Security Settings Block */}
      <Card className="rounded-3xl border border-slate-200 shadow-sm mt-12 bg-white">
        <CardHeader className="border-b bg-slate-50 rounded-t-3xl pb-4">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800"><Settings className="w-5 h-5 text-slate-500"/> Account Security Settings</CardTitle>
          <CardDescription>Update your login credentials or permanently delete your account here.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          <div className="grid gap-4 md:grid-cols-2 border-b pb-6">
            <div>
              <Label className="text-slate-700 font-semibold">Change Login Email</Label>
              <p className="text-xs text-slate-500 mb-2 mt-1">Current email: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{user?.email}</span></p>
              <div className="flex gap-2 mt-2">
                <Input type="email" placeholder="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={authLoading} />
                <Button variant="outline" onClick={() => handleUpdateAuth("email")} disabled={authLoading || !newEmail}>Update</Button>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-700 font-semibold">Change Password</Label>
              <p className="text-xs text-slate-500 mb-2 mt-1">Enter a secure new password for your account.</p>
              <div className="flex gap-2 mt-2">
                <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={authLoading} />
                <Button variant="outline" onClick={() => handleUpdateAuth("password")} disabled={authLoading || !newPassword}>Update</Button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-red-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</h4>
              <p className="text-sm text-red-700 mt-1">Permanently delete your account and all associated profile data. This cannot be undone.</p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={authLoading} className="shrink-0">
              Delete My Account
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}