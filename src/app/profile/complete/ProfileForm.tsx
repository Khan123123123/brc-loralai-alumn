"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserCircle2, Briefcase, MapPin, GraduationCap, Lock, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Award, Loader2, Link2, EyeOff, ShieldCheck } from "lucide-react";

const safeParseArray = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default function ProfileForm({ profile, answers, isVerified }: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = 4;
  
  // Account Type State for conditional rendering
  const [accountType, setAccountType] = useState(profile.account_type || "Alumni");

  // Arrays State
  const [jobs, setJobs] = useState<any[]>(safeParseArray(profile.job_history));
  const [edu, setEdu] = useState<any[]>(safeParseArray(profile.higher_education));

  // Toggles State (Rock solid boolean tracking for forms)
  const [showInDir, setShowInDir] = useState(profile.show_in_directory !== false); // Default true
  const [showEmail, setShowEmail] = useState(profile.show_email_publicly !== false);
  const [showLinkedIn, setShowLinkedIn] = useState(profile.show_linkedin_publicly !== false);
  const [showPhone, setShowPhone] = useState(!!profile.show_phone_publicly);
  const [mentor, setMentor] = useState(!!profile.available_for_mentoring);

  let defaultLanguages = Array.isArray(profile.languages) ? profile.languages.join(", ") : (profile.languages || "");
  let defaultSubjects = Array.isArray(profile.subjects_taught) ? profile.subjects_taught.join(", ") : (profile.subjects_taught || "");

  const addJob = () => setJobs([...jobs, { company: "", title: "", start_date: "", end_date: "", is_current: false }]);
  const removeJob = (index: number) => setJobs(jobs.filter((_, i) => i !== index));
  const updateJob = (index: number, field: string, value: any) => {
    const newJobs = [...jobs];
    newJobs[index][field] = value;
    setJobs(newJobs);
  };

  const addEdu = () => setEdu([...edu, { institution: "", degree: "", field: "", start_date: "", end_date: "" }]);
  const removeEdu = (index: number) => setEdu(edu.filter((_, i) => i !== index));
  const updateEdu = (index: number, field: string, value: any) => {
    const newEdu = [...edu];
    newEdu[index][field] = value;
    setEdu(newEdu);
  };

  const jumpToStep = (s: number) => {
    if (profile.is_profile_complete) setStep(s);
  };
  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);
    
    if (res?.error) {
      alert("Error saving profile: " + res.error);
      setIsSaving(false);
    } else {
      router.push("/profile/me");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      <input type="hidden" name="job_history" value={JSON.stringify(jobs)} />
      <input type="hidden" name="higher_education" value={JSON.stringify(edu)} />
      
      {/* Absolute reliable hidden inputs for toggles */}
      <input type="hidden" name="show_in_directory" value={showInDir ? "on" : "off"} />
      <input type="hidden" name="show_email_publicly" value={showEmail ? "on" : "off"} />
      <input type="hidden" name="show_linkedin_publicly" value={showLinkedIn ? "on" : "off"} />
      <input type="hidden" name="show_phone_publicly" value={showPhone ? "on" : "off"} />
      <input type="hidden" name="available_for_mentoring" value={mentor ? "on" : "off"} />

      {/* STEP PROGRESS BAR */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map((s) => (
          <button 
            key={s} 
            type="button" 
            onClick={() => jumpToStep(s)}
            className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${step === s ? 'ring-4 ring-primary/20' : ''} ${step >= s ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'} ${profile.is_profile_complete ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            {step > s && !profile.is_profile_complete ? <CheckCircle2 className="w-5 h-5" /> : s}
          </button>
        ))}
      </div>

      {/* STEP 1: BASIC INFO */}
      {step === 1 && (
        <Card className="rounded-3xl shadow-sm border-slate-200 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><UserCircle2 className="w-5 h-5 text-primary" /> Step 1: Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="full_name" defaultValue={profile.full_name || ""} required className="rounded-xl bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <select name="account_type" value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                <option value="Alumni">Alumnus / Former Student</option>
                <option value="Faculty">Faculty Member</option>
                <option value="Student">Current Student</option>
              </select>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label>Profile Picture / Avatar URL</Label>
              <Input name="profile_photo_url" defaultValue={profile.profile_photo_url || ""} placeholder="https://example.com/your-photo.jpg" className="rounded-xl bg-slate-50" />
              <p className="text-xs text-slate-500">Paste a direct link to an image (e.g., from LinkedIn or an image host).</p>
            </div>

            {accountType === "Faculty" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Subjects Taught</Label>
                <Input name="subjects_taught" defaultValue={defaultSubjects} placeholder="e.g. Physics, Mathematics (comma separated)" className="rounded-xl bg-slate-50 border-indigo-200 focus-visible:ring-indigo-500" />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label>Professional Bio</Label>
              <Textarea name="bio" defaultValue={profile.bio || ""} placeholder="A short bio about your current professional journey." rows={3} className="rounded-xl bg-slate-50 border-slate-200 resize-none" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Languages Spoken</Label>
              <Input name="languages" defaultValue={defaultLanguages} placeholder="e.g. English, Urdu, Pashto (comma separated)" className="rounded-xl bg-slate-50" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: BRC DETAILS */}
      {step === 2 && (
        <Card className="rounded-3xl shadow-sm border-slate-200 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-primary" /> Step 2: Koharian Journey</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Entry Year</Label>
              <Input name="entry_year" type="number" defaultValue={profile.entry_year || ""} placeholder="e.g. 2005" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input name="graduation_year" type="number" defaultValue={profile.graduation_year || ""} placeholder="e.g. 2010" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>College Kit Number (Roll No)</Label>
              <Input name="roll_number" defaultValue={profile.roll_number || ""} placeholder="e.g. 1234" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Admission Type</Label>
              <select name="regular_self_finance" defaultValue={profile.regular_self_finance || "Regular"} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                <option value="Regular">Regular</option>
                <option value="Self-Finance">Self-Finance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Student Type</Label>
              <select name="student_type" defaultValue={profile.student_type || "Hostelite"} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                <option value="Hostelite">Hostelite</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Favorite BRC Teacher(s)</Label>
              <Input name="favorite_teacher" defaultValue={profile.favorite_teacher || ""} placeholder="Who inspired you the most?" className="rounded-xl bg-slate-50" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500"/> BRC Achievements</Label>
              <Textarea name="achievements_brc" defaultValue={profile.achievements_brc || ""} placeholder="e.g. Debate Captain, Best Athlete, House Prefect..." rows={3} className="rounded-xl bg-slate-50 resize-none" />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label>Life After BRC (Achievements)</Label>
              <Textarea name="achievements_after" defaultValue={profile.achievements_after || ""} placeholder="e.g. Fulbright Scholar, Founded a startup, Civil Service..." rows={3} className="rounded-xl bg-slate-50 resize-none" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Message for Koharians</Label>
              <Textarea name="message_for_koharians" defaultValue={profile.message_for_koharians || ""} placeholder="Leave a word of advice or a memory for the community." rows={2} className="rounded-xl bg-slate-50 resize-none" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: PROFESSIONAL & EDUCATION */}
      {step === 3 && (
        <Card className="rounded-3xl shadow-sm border-slate-200 animate-in fade-in slide-in-from-right-8 duration-500">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-primary" /> Step 3: Professional & Education</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <select name="employment_status" defaultValue={profile.employment_status || "Employed"} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                  <option value="Not Working">Not Working</option>
                  <option value="House Wife/Husband">House Wife/Husband</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input name="experience_years" type="number" defaultValue={profile.experience_years || ""} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Current Position / Job Title</Label>
                <Input name="current_position" defaultValue={profile.current_position || ""} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Company / Organization</Label>
                <Input name="current_organization" defaultValue={profile.current_organization || ""} className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Profession</Label>
                <Input name="profession" defaultValue={profile.profession || ""} placeholder="e.g. Software Engineer" className="rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input name="industry" defaultValue={profile.industry || ""} placeholder="e.g. IT, Healthcare" className="rounded-xl bg-slate-50" />
              </div>
            </div>

            {/* Dynamic Higher Education */}
            <div className="border-t pt-6">
               <div className="flex justify-between items-center mb-4">
                 <Label className="text-base font-bold">Higher Education History</Label>
                 <Button type="button" onClick={addEdu} variant="outline" size="sm" className="rounded-xl gap-2"><Plus className="w-4 h-4"/> Add Degree</Button>
               </div>
               {edu.map((ed, i) => (
                 <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 relative">
                   <button type="button" onClick={() => removeEdu(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                   <div className="grid gap-4 sm:grid-cols-2 mt-2">
                     <Input placeholder="Institution Name" value={ed.institution || ""} onChange={(e) => updateEdu(i, "institution", e.target.value)} className="bg-white" />
                     <Input placeholder="Degree (e.g. BS, Masters)" value={ed.degree || ""} onChange={(e) => updateEdu(i, "degree", e.target.value)} className="bg-white" />
                     <Input placeholder="Field of Study" value={ed.field || ""} onChange={(e) => updateEdu(i, "field", e.target.value)} className="bg-white" />
                     <div className="flex gap-2">
                       <Input placeholder="Start Year" value={ed.start_date || ""} onChange={(e) => updateEdu(i, "start_date", e.target.value)} className="bg-white" />
                       <Input placeholder="End Year" value={ed.end_date || ""} onChange={(e) => updateEdu(i, "end_date", e.target.value)} className="bg-white" />
                     </div>
                   </div>
                 </div>
               ))}
            </div>

            {/* Dynamic Job History */}
            <div className="border-t pt-6">
               <div className="flex justify-between items-center mb-4">
                 <Label className="text-base font-bold">Past Job History</Label>
                 <Button type="button" onClick={addJob} variant="outline" size="sm" className="rounded-xl gap-2"><Plus className="w-4 h-4"/> Add Job</Button>
               </div>
               {jobs.map((job, i) => (
                 <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 relative">
                   <button type="button" onClick={() => removeJob(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                   <div className="grid gap-4 sm:grid-cols-2 mt-2">
                     <Input placeholder="Company Name" value={job.company || ""} onChange={(e) => updateJob(i, "company", e.target.value)} className="bg-white" />
                     <Input placeholder="Job Title" value={job.title || ""} onChange={(e) => updateJob(i, "title", e.target.value)} className="bg-white" />
                     <div className="flex gap-2">
                       <Input placeholder="Start Year" value={job.start_date || ""} onChange={(e) => updateJob(i, "start_date", e.target.value)} className="bg-white" />
                       <Input placeholder="End Year" value={job.end_date || ""} onChange={(e) => updateJob(i, "end_date", e.target.value)} className="bg-white" />
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: LOCATION & PRIVACY */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-primary" /> Step 4: Location & Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label>Current City</Label><Input name="current_city" defaultValue={profile.current_city || ""} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Current Country</Label><Input name="current_country" defaultValue={profile.current_country || ""} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Home City (Originally from)</Label><Input name="home_city" defaultValue={profile.home_city || ""} placeholder="e.g. Quetta" className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Home District</Label><Input name="home_district" defaultValue={profile.home_district || ""} placeholder="e.g. Loralai" className="rounded-xl bg-slate-50" /></div>
              
              <div className="space-y-2"><Label>Phone Number</Label><Input name="phone_number" defaultValue={profile.phone || profile.phone_number || ""} type="tel" className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedin_url" defaultValue={profile.linkedin_url || ""} type="url" placeholder="https://linkedin.com/in/..." className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Twitter/X URL</Label><Input name="twitter_url" defaultValue={profile.twitter_url || ""} type="url" placeholder="https://twitter.com/..." className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Personal Website</Label><Input name="website_url" defaultValue={profile.website_url || ""} type="url" placeholder="https://..." className="rounded-xl bg-slate-50" /></div>
              
              <div className="sm:col-span-2 border-t pt-6 mt-2 space-y-4">
                 <Label className="text-base font-extrabold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary"/> Privacy & Directory Settings</Label>
                 
                 <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={showInDir} onChange={(e) => setShowInDir(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300" />
                    <div>
                      <div className="font-bold text-slate-900">Show my profile in the Alumni Directory</div>
                      <div className="text-xs text-slate-500">Uncheck to hide your account completely from public search.</div>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300" />
                    <div>
                      <div className="font-bold text-slate-900">Make Email visible to Verified Members</div>
                      <div className="text-xs text-slate-500">Uncheck to hide your email. Unverified users can NEVER see it.</div>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={showLinkedIn} onChange={(e) => setShowLinkedIn(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300" />
                    <div>
                      <div className="font-bold text-slate-900">Make LinkedIn visible to Verified Members</div>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300" />
                    <div>
                      <div className="font-bold text-slate-900">Make Phone Number visible to Verified Members</div>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors mt-6">
                    <input type="checkbox" checked={mentor} onChange={(e) => setMentor(e.target.checked)} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-600 border-emerald-300" />
                    <div>
                      <div className="font-bold text-emerald-900">I am available to mentor junior alumni</div>
                      <div className="text-xs text-emerald-700/80">Adds a badge to your profile so students can reach out.</div>
                    </div>
                 </label>
              </div>
            </CardContent>
          </Card>

          {!isVerified && (
            <Card className="rounded-3xl shadow-sm border-amber-200 bg-amber-50/30">
              <CardHeader className="border-b border-amber-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-900"><Lock className="w-5 h-5" /> Verification Questions</CardTitle>
                <CardDescription className="text-amber-800 font-medium">Please answer at least two to help us verify you.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label className="text-amber-900">House</Label><Input name="verify_houses" defaultValue={answers?.houses || ""} className="rounded-xl bg-white border-amber-200" /></div>
                <div className="space-y-2"><Label className="text-amber-900">Two Teachers</Label><Input name="verify_teachers" defaultValue={answers?.teachers || ""} className="rounded-xl bg-white border-amber-200" /></div>
                <div className="space-y-2"><Label className="text-amber-900">Hostel Staff</Label><Input name="verify_staff" defaultValue={answers?.staff || ""} className="rounded-xl bg-white border-amber-200" /></div>
                <div className="space-y-2"><Label className="text-amber-900">Principal</Label><Input name="verify_principal" defaultValue={answers?.principal || ""} className="rounded-xl bg-white border-amber-200" /></div>
                <div className="space-y-2 sm:col-span-2"><Label className="text-amber-900">BRC Est. Year</Label><Input name="verify_established_year" defaultValue={answers?.established_year || ""} className="rounded-xl bg-white border-amber-200" /></div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || isSaving} className="rounded-xl px-6 h-12 font-bold gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        
        {step < totalSteps ? (
          <div className="flex gap-3">
            {/* Show Quick Save if editing to prevent forced 4-step wizard */}
            {profile.is_profile_complete && (
               <Button type="submit" disabled={isSaving} className="rounded-xl px-6 h-12 font-bold bg-slate-200 text-slate-800 hover:bg-slate-300">
                  Quick Save
               </Button>
            )}
            <Button type="button" onClick={nextStep} disabled={isSaving} className="rounded-xl px-8 h-12 font-bold gap-2 bg-primary text-white hover:bg-blue-900 shadow-md">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button type="submit" disabled={isSaving} className="rounded-xl px-10 h-12 font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl hover:scale-105 transition-all">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</> : "Save Profile"}
          </Button>
        )}
      </div>
    </form>
  );
}