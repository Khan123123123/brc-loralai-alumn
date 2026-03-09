"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserCircle2, Briefcase, MapPin, GraduationCap, Lock, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Award, Loader2, ShieldCheck, BookOpen, EyeOff, Star } from "lucide-react";

const DISTRICTS = [
  "Quetta", "Loralai", "Zhob", "Musakhel", "Barkhan", "Kohlu", "Dera Bugti", "Sibi", 
  "Ziarat", "Harnai", "Pishin", "Killa Abdullah", "Chaman", "Killa Saifullah", "Sherani", 
  "Kalat", "Mastung", "Khuzdar", "Awaran", "Kharan", "Washuk", "Nushki", "Chagai", 
  "Surab", "Panjgur", "Kech", "Gwadar", "Lasbela", "Hub", "Usta Muhammad", "Jaffarabad", 
  "Nasirabad", "Sohbatpur", "Jhal Magsi", "Kachhi (Bolan)", "Dera Ghazi Khan", "Multan", 
  "Lahore", "Islamabad", "Rawalpindi", "Karachi", "Other"
];

const PROFESSIONS = [
  "Software/IT Professional", "Doctor/Medical", "Civil Engineer", "Engineer (Other)", 
  "Architect/Urban Planner", "Teacher/Professor", "Businessman/Entrepreneur", 
  "Civil Servant/CSP", "Military/Armed Forces", "Banker/Finance", "Lawyer/Legal", 
  "Journalist/Media", "Student", "Other"
];

const INDUSTRIES = [
  "Technology & IT", "Healthcare & Medical", "Construction & Real Estate", 
  "Education & Academia", "Government & Public Sector", "Defense & Military", 
  "Finance & Banking", "Legal & Judiciary", "Media & Communications", "Agriculture", 
  "Energy, Oil & Gas", "Non-Profit & NGO", "Other"
];

const safeParseArray = (data: any): any[] => {
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

interface ProfileFormProps {
  profile: any;
  answers: any;
  isVerified: boolean;
}

export default function ProfileForm({ profile, answers, isVerified }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.profile_photo_url || "");
  const totalSteps = 4;

  const [accountType, setAccountType] = useState<string>(profile.account_type || "Alumni");

  const [jobs, setJobs] = useState<any[]>(safeParseArray(profile.job_history));
  const [edu, setEdu] = useState<any[]>(safeParseArray(profile.higher_education));
  
  const isPhoneHiddenInDB = profile.show_phone === false || profile.show_phone_publicly === false;
  const [hidePhone, setHidePhone] = useState<boolean>(isPhoneHiddenInDB);
  const [mentor, setMentor] = useState<boolean>(!!profile.available_for_mentoring);
  const [wantsFeatured, setWantsFeatured] = useState<boolean>(!!profile.wants_to_be_featured);

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
  const nextStep = () => {
    // Validate current step before moving to next
    const currentForm = document.querySelector('form');
    if (currentForm && !currentForm.checkValidity()) {
      currentForm.reportValidity();
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      const compressedFile = await compressImage(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      alert('Error uploading image!');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);
    
    if (res?.error) {
      alert("Error saving profile: " + res.error);
      setIsSaving(false);
    } else {
      window.location.href = "/profile/me";
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const isFaculty = accountType === "Faculty";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8 relative">
        <input type="hidden" name="job_history" value={JSON.stringify(jobs)} />
        <input type="hidden" name="higher_education" value={JSON.stringify(edu)} />
        <input type="hidden" name="show_phone" value={hidePhone ? "off" : "on"} />
        <input type="hidden" name="available_for_mentoring" value={mentor ? "on" : "off"} />
        <input type="hidden" name="wants_to_be_featured" value={wantsFeatured ? "on" : "off"} />
        <input type="hidden" name="profile_photo_url" value={avatarUrl} />

        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
          
          {[1, 2, 3, 4].map((s) => (
            <button 
              key={`step-${s}`} 
              type="button" 
              onClick={() => jumpToStep(s)}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${step === s ? 'ring-4 ring-primary/20' : ''} ${step >= s ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'} ${profile.is_profile_complete ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            >
              {step > s && !profile.is_profile_complete ? <CheckCircle2 className="w-5 h-5" /> : s}
            </button>
          ))}
        </div>

        {/* STEP 1: BASIC INFO */}
        <div className={step === 1 ? "block animate-in fade-in slide-in-from-right-8 duration-500" : "hidden"}>
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><UserCircle2 className="w-5 h-5 text-primary" /> Step 1: Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input name="full_name" defaultValue={profile.full_name || ""} onKeyDown={handleKeyDown} required className="rounded-xl bg-slate-50" />
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
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border overflow-hidden shrink-0">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : <UserCircle2 className="w-full h-full text-slate-300 p-2" />}
                  </div>
                  <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="bg-slate-50" />
                    {uploadingImage && <span className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading & Compressing...</span>}
                  </div>
                </div>
              </div>

              {isFaculty && (
                <div className="space-y-2 sm:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <Label className="text-indigo-900 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Subjects Taught at BRC</Label>
                  <Input name="subjects_taught" defaultValue={defaultSubjects} onKeyDown={handleKeyDown} placeholder="e.g. Physics, Chemistry, English (comma separated)" className="rounded-xl bg-white border-indigo-200" />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label>Professional Bio & Current Focus</Label>
                <Textarea name="bio" defaultValue={profile.bio || ""} placeholder="A short bio about yourself..." rows={3} className="rounded-xl bg-slate-50 resize-none" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Languages Spoken</Label>
                <Input name="languages" defaultValue={defaultLanguages} onKeyDown={handleKeyDown} placeholder="e.g. English, Urdu, Pashto (comma separated)" className="rounded-xl bg-slate-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STEP 2: DYNAMIC BRC DETAILS */}
        <div className={step === 2 ? "block animate-in fade-in slide-in-from-right-8 duration-500" : "hidden"}>
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-primary" /> 
                {isFaculty ? "Step 2: Faculty Tenure at BRC" : "Step 2: Koharian Journey"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              
              <div className="space-y-2">
                <Label>{isFaculty ? "Year Joined BRC as Faculty *" : "Entry Year (Admission) *"}</Label>
                <Input name="entry_year" type="number" defaultValue={profile.entry_year || ""} onKeyDown={handleKeyDown} placeholder="e.g. 2005" className="rounded-xl bg-slate-50" required />
              </div>
              
              <div className="space-y-2">
                <Label>{isFaculty ? "Year Left BRC (Leave blank if current) *" : "Graduation / Passing Year *"}</Label>
                <Input name="graduation_year" type="number" defaultValue={profile.graduation_year || ""} onKeyDown={handleKeyDown} placeholder="e.g. 2010" className="rounded-xl bg-slate-50" required />
              </div>

              {!isFaculty && (
                <>
                  <div className="space-y-2">
                    <Label>College Kit Number (Roll No)</Label>
                    <Input name="roll_number" defaultValue={profile.roll_number || ""} onKeyDown={handleKeyDown} placeholder="e.g. 1234" className="rounded-xl bg-slate-50" />
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
                    <Label>Favorite Teacher(s) at BRC</Label>
                    <Input name="favorite_teacher" defaultValue={profile.favorite_teacher || ""} onKeyDown={handleKeyDown} placeholder="Who inspired you?" className="rounded-xl bg-slate-50" />
                  </div>
                </>
              )}

              <div className="space-y-2 sm:col-span-2 pt-2 border-t mt-2 border-slate-100">
                <Label className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500"/> {isFaculty ? "Memories & Milestones at BRC" : "Achievements at BRC"}</Label>
                <Textarea name="achievements_brc" defaultValue={profile.achievements_brc || ""} placeholder={isFaculty ? "Share a fond memory, achievement, or houses you supervised..." : "e.g. Debate Captain, Best Athlete, House Prefect..."} rows={3} className="rounded-xl bg-slate-50 resize-none" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>{isFaculty ? "Life / Career After BRC" : "Life After BRC"}</Label>
                <Textarea name="achievements_after" defaultValue={profile.achievements_after || ""} placeholder="What have you accomplished since?" rows={3} className="rounded-xl bg-slate-50 resize-none" />
              </div>

              {/* FEATURED ALUMNI NOMINATION SECTION */}
              <div className="space-y-4 sm:col-span-2 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
                  <input type="checkbox" checked={wantsFeatured} onChange={(e) => setWantsFeatured(e.target.checked)} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-600 border-amber-300" />
                  <div>
                    <div className="font-bold text-amber-900 flex items-center gap-2"><Star className="w-4 h-4"/> Nominate me for Featured Alumni</div>
                    <div className="text-xs text-amber-700/80">Check this if you want your profile highlighted in the Featured tab. Provide details of all your achievements below.</div>
                  </div>
                </label>

                {wantsFeatured && (
                  <div className="space-y-2 animate-in fade-in zoom-in-95">
                    <Label className="text-amber-900 font-bold">Detailed Achievements for Feature Consideration *</Label>
                    <Textarea name="achievements" defaultValue={profile.achievements || ""} required={wantsFeatured} placeholder="Please list your major awards, career milestones, and contributions..." rows={4} className="rounded-xl bg-white border-amber-200 resize-none" />
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Message for Koharians</Label>
                <Textarea name="message_for_koharians" defaultValue={profile.message_for_koharians || ""} placeholder={isFaculty ? "Leave a message of advice for your former students." : "Leave a word of advice or a memory for the community."} rows={2} className="rounded-xl bg-slate-50 resize-none" />
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* STEP 3: PROFESSIONAL & DROPDOWNS */}
        <div className={step === 3 ? "block animate-in fade-in slide-in-from-right-8 duration-500" : "hidden"}>
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-primary" /> Step 3: Professional & Education</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Employment Status *</Label>
                  <select name="employment_status" defaultValue={profile.employment_status || "Employed"} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium" required>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                    <option value="Not Working">Not Working</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Years of Experience</Label><Input name="experience_years" type="number" defaultValue={profile.experience_years || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" /></div>
                
                <div className="space-y-2"><Label>Current Position / Job Title *</Label><Input name="current_position" defaultValue={profile.current_position || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" required /></div>
                <div className="space-y-2"><Label>Company / Organization *</Label><Input name="current_organization" defaultValue={profile.current_organization || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" required /></div>
                
                <div className="space-y-2">
                  <Label>Profession *</Label>
                  <select name="profession" defaultValue={profile.profession || ""} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium" required>
                     <option value="">Select Profession...</option>
                     {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <select name="industry" defaultValue={profile.industry || ""} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium" required>
                     <option value="">Select Industry...</option>
                     {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                 <div className="flex justify-between items-center mb-4">
                   <Label className="text-base font-bold">Higher Education</Label>
                   <Button type="button" onClick={addEdu} variant="outline" size="sm" className="rounded-xl gap-2"><Plus className="w-4 h-4"/> Add Degree</Button>
                 </div>
                 {edu.map((ed: any, i: number) => (
                   <div key={`edu-${i}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 relative">
                     <button type="button" onClick={() => removeEdu(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                     <div className="grid gap-4 sm:grid-cols-2 mt-2">
                       <Input placeholder="Institution Name" value={ed.institution || ""} onChange={(e) => updateEdu(i, "institution", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       <Input placeholder="Degree" value={ed.degree || ""} onChange={(e) => updateEdu(i, "degree", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       <Input placeholder="Field of Study" value={ed.field || ""} onChange={(e) => updateEdu(i, "field", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       <div className="flex gap-2">
                         <Input placeholder="Start" value={ed.start_date || ""} onChange={(e) => updateEdu(i, "start_date", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                         <Input placeholder="End" value={ed.end_date || ""} onChange={(e) => updateEdu(i, "end_date", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       </div>
                     </div>
                   </div>
                 ))}
              </div>

              <div className="border-t pt-6">
                 <div className="flex justify-between items-center mb-4">
                   <Label className="text-base font-bold">Past Job History</Label>
                   <Button type="button" onClick={addJob} variant="outline" size="sm" className="rounded-xl gap-2"><Plus className="w-4 h-4"/> Add Job</Button>
                 </div>
                 {jobs.map((job: any, i: number) => (
                   <div key={`job-${i}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 relative">
                     <button type="button" onClick={() => removeJob(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                     <div className="grid gap-4 sm:grid-cols-2 mt-2">
                       <Input placeholder="Company Name" value={job.company || ""} onChange={(e) => updateJob(i, "company", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       <Input placeholder="Job Title" value={job.title || ""} onChange={(e) => updateJob(i, "title", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       <div className="flex gap-2">
                         <Input placeholder="Start Date" value={job.start_date || ""} onChange={(e) => updateJob(i, "start_date", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                         <Input placeholder="End Date" value={job.end_date || ""} onChange={(e) => updateJob(i, "end_date", e.target.value)} onKeyDown={handleKeyDown} className="bg-white" />
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STEP 4: CONTACT, LOCATION & PRIVACY */}
        <div className={step === 4 ? "block animate-in fade-in slide-in-from-right-8 duration-500" : "hidden"}>
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-primary" /> Step 4: Location & Contact Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label>Current City *</Label><Input name="current_city" defaultValue={profile.current_city || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" required /></div>
              <div className="space-y-2"><Label>Current Country</Label><Input name="current_country" defaultValue={profile.current_country || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" /></div>
              
              <div className="space-y-2"><Label>Home City *</Label><Input name="home_city" defaultValue={profile.home_city || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" required /></div>
              
              <div className="space-y-2">
                <Label>Home District (Origin)</Label>
                <select name="home_district" defaultValue={profile.home_district || ""} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                   <option value="">Select District...</option>
                   {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="space-y-2"><Label>Phone Number *</Label><Input name="phone_number" defaultValue={profile.phone || profile.phone_number || ""} onKeyDown={handleKeyDown} type="tel" className="rounded-xl bg-slate-50" required /></div>
              <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedin_url" defaultValue={profile.linkedin_url || ""} type="url" onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Twitter/X URL</Label><Input name="twitter_url" defaultValue={profile.twitter_url || ""} type="url" onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Personal Website</Label><Input name="website_url" defaultValue={profile.website_url || ""} type="url" onKeyDown={handleKeyDown} className="rounded-xl bg-slate-50" /></div>

              <div className="sm:col-span-2 border-t pt-6 mt-2 space-y-4">
                 <Label className="text-base font-extrabold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary"/> Privacy Settings</Label>
                 
                 <label className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 cursor-pointer hover:bg-rose-100 transition-colors">
                    <input type="checkbox" checked={hidePhone} onChange={(e) => setHidePhone(e.target.checked)} className="w-5 h-5 rounded text-rose-600 focus:ring-rose-600 border-rose-300" />
                    <div>
                      <div className="font-bold text-rose-900 flex items-center gap-2"><EyeOff className="w-4 h-4"/> Hide my Phone Number</div>
                      <div className="text-xs text-rose-700/80 mt-0.5">Check this box to hide your phone number from the directory. By default, it is visible to verified members.</div>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors mt-4">
                    <input type="checkbox" checked={mentor} onChange={(e) => setMentor(e.target.checked)} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-600 border-emerald-300" />
                    <div>
                      <div className="font-bold text-emerald-900">I am available to mentor junior alumni</div>
                      <div className="text-xs text-emerald-700/80">Adds a badge to your profile so students can reach out.</div>
                    </div>
                 </label>
              </div>
            </CardContent>
          </Card>

          {/* VERIFICATION QUESTIONS */}
          {!isVerified && (
            <Card className="rounded-3xl shadow-sm border-amber-200 bg-amber-50/30 mt-8">
              <CardHeader className="border-b border-amber-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-900"><Lock className="w-5 h-5" /> Verification Questions</CardTitle>
                <CardDescription className="text-amber-800 font-medium">Please answer the following questions to help us verify your identity. Providing detailed and accurate answers will speed up the verification process.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label className="text-amber-900">Names of Houses/Hostels at BRC *</Label><Input name="verify_houses" defaultValue={answers?.houses || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-white border-amber-200" required /></div>
                <div className="space-y-2"><Label className="text-amber-900">Name Two Teachers with their Subjects *</Label><Input name="verify_teachers_with_subjects" defaultValue={answers?.teachers_with_subjects || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-white border-amber-200" required /></div>
                <div className="space-y-2"><Label className="text-amber-900">Name any famous or long-serving staff member *</Label><Input name="verify_staff_member" defaultValue={answers?.staff_member || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-white border-amber-200" required /></div>
                <div className="space-y-2"><Label className="text-amber-900">Name a Current or Past Principal *</Label><Input name="verify_principal" defaultValue={answers?.principal || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-white border-amber-200" required /></div>
                <div className="space-y-2 sm:col-span-2"><Label className="text-amber-900">Name the Hostel named after a former Principal</Label><Input name="verify_hostel_after_principal" defaultValue={answers?.hostel_after_principal || ""} onKeyDown={handleKeyDown} className="rounded-xl bg-white border-amber-200" /></div>
                <div className="space-y-2 sm:col-span-2"><Label className="text-amber-900">Any other information proving you are a REAL Koharian</Label><Textarea name="verify_other_proof" defaultValue={answers?.other_proof || ""} rows={2} className="rounded-xl bg-white border-amber-200 resize-none" /></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || isSaving} className="rounded-xl px-6 h-12 font-bold gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          
          {step < totalSteps ? (
            <div className="flex gap-3">
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
    </div>
  );
}