"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateProfileScore, getAccessLevelFromProfile, getLegacyVerificationStatus, isProfileComplete } from "@/lib/utils/verification";
import { slugifyProfileName } from "@/lib/utils/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Education, Job } from "@/types/database";
import { deleteMyAccount } from "@/app/profile/actions";
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, ShieldCheck, Lock, Settings, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const districts = ["Awaran", "Barkhan", "Chagai", "Chaman", "Dera Bugti", "Duki", "Gwadar", "Harnai", "Hub", "Jafarabad", "Jhal Magsi", "Kachhi (Bolan)", "Kalat", "Kech (Turbat)", "Kharan", "Khuzdar", "Killa Abdullah", "Killa Saifullah", "Kohlu", "Lasbela", "Loralai", "Mastung", "Musakhel", "Naseerabad", "Nushki", "Panjgur", "Pishin", "Quetta", "Sherani", "Sibi", "Sohbatpur", "Surab", "Usta Muhammad", "Washuk", "Zhob", "Ziarat", "Other"];
const studentTypes = ["Hostelite", "Day Scholar"];
const employmentStatuses = ["Employed", "Self-Employed", "Business Owner", "Student", "Retired", "Not Working", "House Wife/Husband"];
const industries = ["Healthcare/Medical", "IT/Software/Technology", "Education/Teaching", "Government/Public Sector", "Business/Trade", "Banking/Finance", "Engineering", "Law/Legal", "Media/Journalism", "Agriculture", "Military/Defense", "Real Estate", "Transportation", "Construction", "Mining", "Other"];

type FormDataType = {
  full_name: string; entry_year: string; graduation_year: string; home_district: string; student_type: string; regular_self_finance: string; roll_number: string;
  current_country: string; current_city: string; current_position: string; profession: string; current_organization: string; industry: string; experience_years: string; employment_status: string;
  higher_education: Education[]; job_history: Job[];
  phone: string; linkedin_url: string; languages: string[]; bio: string; achievements: string;
  featured_in_presentation: boolean; available_for_mentoring: boolean;
  show_phone_publicly: boolean; show_email_publicly: boolean; show_linkedin_publicly: boolean; show_in_directory: boolean;
  verification_answers: { houses: string; teachers: string; staff: string; principal: string; established_year: string; };
};

const emptyForm: FormDataType = {
  full_name: "", entry_year: "", graduation_year: "", home_district: "", student_type: "", regular_self_finance: "", roll_number: "",
  current_country: "Pakistan", current_city: "", current_position: "", profession: "", current_organization: "", industry: "", experience_years: "", employment_status: "",
  higher_education: [], job_history: [],
  phone: "", linkedin_url: "", languages: [], bio: "", achievements: "",
  featured_in_presentation: false, available_for_mentoring: false,
  show_phone_publicly: true, show_email_publicly: true, show_linkedin_publicly: true, show_in_directory: true,
  verification_answers: { houses: "", teachers: "", staff: "", principal: "", established_year: "" },
};

export default function CompleteProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [bootLoading, setBootLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAlreadyApproved, setIsAlreadyApproved] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(emptyForm);
  const [banner, setBanner] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
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
        const approved = profile.admin_status === "approved" || profile.verification_status === "full" || profile.access_level === "full";
        setIsAlreadyApproved(approved);

        setFormData({
          full_name: profile.full_name || "", entry_year: profile.entry_year?.toString() || "", graduation_year: profile.graduation_year?.toString() || "", home_district: profile.home_district || "", student_type: profile.student_type || "", regular_self_finance: profile.regular_self_finance || "", roll_number: profile.roll_number || "",
          current_country: profile.current_country || "Pakistan", current_city: profile.current_city || "", current_position: profile.current_position || "", profession: profile.profession || "", current_organization: profile.current_organization || "", industry: profile.industry || "", experience_years: profile.experience_years?.toString() || "", employment_status: profile.employment_status || "",
          higher_education: profile.higher_education || [], job_history: profile.job_history || [],
          phone: profile.phone || "", linkedin_url: profile.linkedin_url || "", languages: profile.languages || [], bio: profile.bio || "", achievements: profile.achievements || "",
          featured_in_presentation: Boolean(profile.featured_in_presentation), available_for_mentoring: Boolean(profile.available_for_mentoring),
          show_phone_publicly: profile.show_phone_publicly === null ? true : Boolean(profile.show_phone_publicly), show_email_publicly: true, show_linkedin_publicly: true, show_in_directory: true,
          verification_answers: { houses: profile.verification_answers?.houses || "", teachers: profile.verification_answers?.teachers || "", staff: profile.verification_answers?.staff || "", principal: profile.verification_answers?.principal || "", established_year: profile.verification_answers?.established_year || "" },
        });
      }
      setBootLoading(false);
    };
    load();
  }, [router, supabase]);

  const setField = (field: keyof FormDataType, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };
  const setVerificationField = (field: keyof FormDataType["verification_answers"], value: string) => { setFormData((prev) => ({ ...prev, verification_answers: { ...prev.verification_answers, [field]: value } })); };

  const addEducation = () => setFormData((prev) => ({ ...prev, higher_education: [...prev.higher_education, { institution: "", degree: "", field: "", start_date: "", end_date: "" }] }));
  const updateEducation = (index: number, field: keyof Education, value: string) => { const updated = [...formData.higher_education]; updated[index] = { ...updated[index], [field]: value }; setField("higher_education", updated); };
  const removeEducation = (index: number) => { const updated = [...formData.higher_education]; updated.splice(index, 1); setField("higher_education", updated); };

  const addJob = () => setFormData((prev) => ({ ...prev, job_history: [...prev.job_history, { company: "", title: "", start_date: "", end_date: "", is_current: false }] }));
  const updateJob = (index: number, field: keyof Job, value: string | boolean) => { const updated = [...formData.job_history]; updated[index] = { ...updated[index], [field]: value }; setField("job_history", updated); };
  const removeJob = (index: number) => { const updated = [...formData.job_history]; updated.splice(index, 1); setField("job_history", updated); };

  const score = useMemo(() => calculateProfileScore(formData), [formData]);
  const computedAccessLevel = useMemo(() => getAccessLevelFromProfile(formData), [formData]);
  const profileComplete = useMemo(() => isProfileComplete(formData), [formData]);

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setBanner(null);

    try {
      const { data: liveProfile } = await supabase.from("profiles").select("admin_status, verification_status, access_level").eq("id", user.id).single();
      const currentlyApprovedInDb = liveProfile?.admin_status === "approved" || liveProfile?.verification_status === "full" || liveProfile?.access_level === "full";

      const computedSlug = slugifyProfileName(formData.full_name || user.email || "member", formData.graduation_year ? parseInt(formData.graduation_year) : null);
      
      const nextAdminStatus = currentlyApprovedInDb ? "approved" : "pending";
      const nextAccessLevel = currentlyApprovedInDb ? "full" : computedAccessLevel;
      const nextVerificationStatus = currentlyApprovedInDb ? "full" : getLegacyVerificationStatus(nextAccessLevel, nextAdminStatus);

      const payload = {
        id: user.id, email: user.email, full_name: formData.full_name || null, slug: computedSlug,
        entry_year: formData.entry_year ? parseInt(formData.entry_year) : null, graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null, home_district: formData.home_district || null, student_type: formData.student_type || null, regular_self_finance: formData.regular_self_finance || null, roll_number: formData.roll_number || null,
        current_country: formData.current_country || "Pakistan", current_city: formData.current_city || null, current_position: formData.current_position || null, profession: formData.profession || null, current_organization: formData.current_organization || null, industry: formData.industry || null, experience_years: formData.experience_years ? parseInt(formData.experience_years) : null, employment_status: formData.employment_status || null,
        higher_education: formData.higher_education, job_history: formData.job_history,
        phone: formData.phone || null, linkedin_url: formData.linkedin_url || null, languages: formData.languages, bio: formData.bio || null, achievements: formData.achievements || null,
        featured_in_presentation: formData.featured_in_presentation, available_for_mentoring: formData.available_for_mentoring,
        show_phone_publicly: formData.show_phone_publicly, show_email_publicly: true, show_linkedin_publicly: true, show_in_directory: true,
        verification_answers: formData.verification_answers, verification_score: score, verification_status: nextVerificationStatus, access_level: nextAccessLevel, admin_status: nextAdminStatus, is_profile_complete: profileComplete, submitted_for_review: !currentlyApprovedInDb, updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;

      setIsAlreadyApproved(currentlyApprovedInDb);
      setBanner({ type: "success", text: "Profile saved successfully." });
      router.refresh();
      setTimeout(() => router.push("/profile/me"), 900);
    } catch (err: any) { setBanner({ type: "error", text: err.message || "Unable to save your profile." }); } finally { setSaving(false); }
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
      alert(`Your ${type} has been successfully updated.`);
      if (type === "email") setNewEmail("");
      if (type === "password") setNewPassword("");
    } catch (e: any) { alert("Error: " + e.message); } finally { setAuthLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("DANGER: This action is permanent and cannot be undone. Are you absolutely sure you want to delete your BRC Loralai Alumni account?")) return;
    setAuthLoading(true);
    try {
      await deleteMyAccount();
      window.location.href = "/auth/login";
    } catch (e: any) { alert("Error deleting account: " + e.message); setAuthLoading(false); }
  };

  if (bootLoading) return <div className="text-center p-10 mt-20 text-slate-500">Loading your profile...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* UPENN COLORED HERO BANNER */}
      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-primary via-primary to-secondary p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between z-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/20 border border-white/20 px-4 py-1.5 text-sm shadow-sm backdrop-blur-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-white" /> Profile Settings
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Edit Your Profile</h1>
            <p className="text-white/90 mt-2 max-w-md text-sm leading-relaxed">Update your academic background, professional experience, and contact details.</p>
          </div>
          <div className="flex-shrink-0">
            <div className="rounded-2xl bg-black/30 backdrop-blur-md px-6 py-4 border border-white/10 shadow-inner">
              <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Account Status</div>
              <div className="font-bold text-lg flex items-center gap-2">
                {isAlreadyApproved ? <ShieldCheck className="w-5 h-5 text-emerald-400 drop-shadow-md" /> : <Lock className="w-5 h-5 text-amber-400" />}
                {isAlreadyApproved ? <span className="text-emerald-400">Verified</span> : <span className="text-amber-400">Unverified</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GAMIFICATION: PROFILE STRENGTH BAR */}
      <div className="mb-8 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Profile Strength
          </span>
          <span className={score >= 70 ? "text-emerald-500" : "text-amber-500"}>{score}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out" 
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 italic mt-2">
          * Aim for 70% or higher to qualify for Full Access verification. Current level mapping: <strong className="uppercase">{computedAccessLevel}</strong> ACCESS.
        </p>
      </div>

      {banner && <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium shadow-sm ${banner.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{banner.text}</div>}

      <Card className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl mb-8 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 pb-6 pt-8">
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Step {step} of 4</CardTitle>
          <CardDescription className="text-base mt-1">
            {step === 1 && "BRC and batch details"}
            {step === 2 && "Education and Experience"}
            {step === 3 && "Contact Details & Bio"}
            {step === 4 && "Verification Questions (Admin Only)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
              <div className="md:col-span-2">
                {isAlreadyApproved && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800/30 flex items-start gap-3 shadow-sm">
                    <Lock className="w-5 h-5 shrink-0 mt-0.5" /> 
                    <p>Your account is verified. Core identity fields (Name and Years) are now locked to protect directory integrity.</p>
                  </div>
                )}
              </div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Full name *</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.full_name} onChange={(e) => setField("full_name", e.target.value)} disabled={isAlreadyApproved} /></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Roll number</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.roll_number} onChange={(e) => setField("roll_number", e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Entry year *</Label><select className={`h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary ${isAlreadyApproved ? "opacity-60 cursor-not-allowed" : ""}`} value={formData.entry_year} onChange={(e) => setField("entry_year", e.target.value)} disabled={isAlreadyApproved}><option value="">Select year</option>{Array.from({ length: 50 }, (_, i) => 1980 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Graduation year *</Label><select className={`h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary ${isAlreadyApproved ? "opacity-60 cursor-not-allowed" : ""}`} value={formData.graduation_year} onChange={(e) => setField("graduation_year", e.target.value)} disabled={isAlreadyApproved}><option value="">Select year</option>{Array.from({ length: 50 }, (_, i) => 1984 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Student type</Label><select className="h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary" value={formData.student_type} onChange={(e) => setField("student_type", e.target.value)}><option value="">Select</option>{studentTypes.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Home district *</Label><select className="h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary" value={formData.home_district} onChange={(e) => setField("home_district", e.target.value)}><option value="">Select</option>{districts.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Current Position / Title *</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.current_position} onChange={(e) => setField("current_position", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Current Organization</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.current_organization} onChange={(e) => setField("current_organization", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Industry</Label><select className="h-11 w-full rounded-xl border border-input bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary" value={formData.industry} onChange={(e) => setField("industry", e.target.value)}><option value="">Select</option>{industries.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
                <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Experience (years)</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" type="number" value={formData.experience_years} onChange={(e) => setField("experience_years", e.target.value)} /></div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-primary dark:text-blue-400">Higher Education</h3><Button type="button" variant="outline" size="sm" className="rounded-full shadow-sm" onClick={addEducation}><Plus className="w-4 h-4 mr-1"/> Add Degree</Button></div>
                <div className="space-y-4">
                  {formData.higher_education.map((edu, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2 bg-white dark:bg-slate-950 p-5 rounded-2xl shadow-sm relative border border-slate-200 dark:border-slate-800">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-full" onClick={() => removeEducation(index)}><Trash2 className="w-4 h-4"/></Button>
                      <div className="space-y-1"><Label className="text-xs text-slate-500">Institution</Label><Input className="h-9" value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs text-slate-500">Degree</Label><Input className="h-9" value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs text-slate-500">Field of Study</Label><Input className="h-9" value={edu.field} onChange={(e) => updateEducation(index, "field", e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs text-slate-500">From</Label><Input className="h-9" type="number" placeholder="YYYY" value={edu.start_date} onChange={(e) => updateEducation(index, "start_date", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-slate-500">To</Label><Input className="h-9" type="number" placeholder="YYYY" value={edu.end_date} onChange={(e) => updateEducation(index, "end_date", e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                  {formData.higher_education.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No degrees added.</p>}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-primary dark:text-blue-400">Job History</h3><Button type="button" variant="outline" size="sm" className="rounded-full shadow-sm" onClick={addJob}><Plus className="w-4 h-4 mr-1"/> Add Job</Button></div>
                <div className="space-y-4">
                  {formData.job_history.map((job, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-2 bg-white dark:bg-slate-950 p-5 rounded-2xl shadow-sm relative border border-slate-200 dark:border-slate-800">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-full" onClick={() => removeJob(index)}><Trash2 className="w-4 h-4"/></Button>
                      <div className="space-y-1"><Label className="text-xs text-slate-500">Company</Label><Input className="h-9" value={job.company} onChange={(e) => updateJob(index, "company", e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs text-slate-500">Title</Label><Input className="h-9" value={job.title} onChange={(e) => updateJob(index, "title", e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs text-slate-500">From</Label><Input className="h-9" type="number" placeholder="YYYY" value={job.start_date} onChange={(e) => updateJob(index, "start_date", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-slate-500">To</Label><Input className="h-9" type="number" placeholder="YYYY" value={job.end_date} onChange={(e) => updateJob(index, "end_date", e.target.value)} disabled={job.is_current} /></div>
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300"><Checkbox checked={job.is_current} onCheckedChange={(c) => updateJob(index, "is_current", Boolean(c))} /> I currently work here</label>
                      </div>
                    </div>
                  ))}
                  {formData.job_history.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No jobs added.</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Current City *</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.current_city} onChange={(e) => setField("current_city", e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Current Country</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.current_country} onChange={(e) => setField("current_country", e.target.value)} /></div>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/50 md:col-span-2 shadow-sm">
                <Label className="text-primary dark:text-blue-300 font-bold text-base">Phone Number</Label>
                <Input className="mt-3 bg-white dark:bg-slate-950 max-w-md rounded-xl" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+92..." />
                <label className="flex items-center gap-3 mt-4 text-sm text-primary/80 dark:text-blue-200 cursor-pointer font-medium">
                  <Checkbox checked={!formData.show_phone_publicly} onCheckedChange={(c) => setField("show_phone_publicly", !c)} />
                  Keep my phone number strictly private (hidden from other alumni)
                </label>
              </div>
              
              <div className="md:col-span-2 space-y-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer font-bold text-emerald-800 dark:text-emerald-300">
                  <Checkbox checked={formData.available_for_mentoring} onCheckedChange={(c) => setField("available_for_mentoring", Boolean(c))} />
                  I am available to Mentor fellow Koharians
                </label>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 ml-7">By checking this, you will appear in the "Mentors Only" directory filter.</p>
              </div>

              <div className="md:col-span-2 space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">LinkedIn URL</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} /></div>
              <div className="md:col-span-2 space-y-2"><Label className="text-slate-600 dark:text-slate-400 font-semibold">Professional Bio</Label><Textarea className="bg-white dark:bg-slate-950 rounded-xl resize-none" value={formData.bio} onChange={(e) => setField("bio", e.target.value)} rows={4} placeholder="Write a short summary of your background..." /></div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-300">
              <div className="md:col-span-2 p-5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 text-amber-900 dark:text-amber-200 rounded-3xl text-sm border border-amber-200 dark:border-amber-800 shadow-sm flex gap-3 items-start">
                <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                <p><strong>Security Verification:</strong> The answers below are strictly confidential. Only platform administrators can view them to confirm your authentic identity.</p>
              </div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 dark:text-slate-300">House names or hostel references</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.verification_answers.houses} onChange={(e) => setVerificationField("houses", e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 dark:text-slate-300">Teachers you remember</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.verification_answers.teachers} onChange={(e) => setVerificationField("teachers", e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 dark:text-slate-300">Staff/Guards (e.g. Ghulam Nabi)</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.verification_answers.staff} onChange={(e) => setVerificationField("staff", e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 dark:text-slate-300">Principal name you remember</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.verification_answers.principal} onChange={(e) => setVerificationField("principal", e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-semibold text-slate-700 dark:text-slate-300">College established year</Label><Input className="bg-white dark:bg-slate-950 rounded-xl" value={formData.verification_answers.established_year} onChange={(e) => setVerificationField("established_year", e.target.value)} /></div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-8 mt-4">
            <Button type="button" variant="outline" className="rounded-full shadow-sm px-6 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setStep((v) => Math.max(1, v - 1))} disabled={step === 1}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            {step < 4 ? (
              <Button type="button" className="rounded-full shadow-md px-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-transform hover:scale-105" onClick={() => setStep((v) => v + 1)}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={saving} className="rounded-full shadow-xl px-8 bg-primary hover:bg-blue-900 text-white font-bold transition-transform hover:scale-105"><Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Profile"}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Security Settings - Hidden by Button */}
      <div className="flex flex-col items-center mt-12 mb-20">
        <Button 
          variant="ghost" 
          onClick={() => setShowSecuritySettings(!showSecuritySettings)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full"
        >
          <Settings className="w-4 h-4 mr-2"/> 
          {showSecuritySettings ? "Hide Security Settings" : "Account Security Settings"} 
          {showSecuritySettings ? <ChevronUp className="w-4 h-4 ml-2"/> : <ChevronDown className="w-4 h-4 ml-2"/>}
        </Button>

        {showSecuritySettings && (
          <div className="w-full mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <Card className="rounded-[2rem] border border-slate-200 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 pb-5">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-slate-100"><Settings className="w-5 h-5 text-primary"/> Credentials</CardTitle>
                <CardDescription>Update your login credentials or permanently delete your account here.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2 border-b dark:border-slate-800 pb-8">
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Label className="text-slate-800 dark:text-slate-200 font-bold">Change Login Email</Label>
                    <p className="text-xs text-slate-500 mb-3 mt-1">Current email: <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border dark:border-slate-700 shadow-sm">{user?.email}</span></p>
                    <div className="flex gap-2">
                      <Input type="email" placeholder="New Email Address" className="bg-white dark:bg-slate-900" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={authLoading} />
                      <Button variant="outline" onClick={() => handleUpdateAuth("email")} disabled={authLoading || !newEmail}>Update</Button>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Label className="text-slate-800 dark:text-slate-200 font-bold">Change Password</Label>
                    <p className="text-xs text-slate-500 mb-3 mt-1">Enter a secure new password for your account.</p>
                    <div className="flex gap-2">
                      <Input type="password" placeholder="New Password" className="bg-white dark:bg-slate-900" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={authLoading} />
                      <Button variant="outline" onClick={() => handleUpdateAuth("password")} disabled={authLoading || !newPassword}>Update</Button>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">
                  <div>
                    <h4 className="font-extrabold text-red-800 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</h4>
                    <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-1 max-w-lg">Permanently delete your account and all associated profile data. This cannot be undone.</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={authLoading} className="shrink-0 rounded-xl font-bold shadow-md">
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}