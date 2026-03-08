"use client";

import { useState } from "react";
import { updateProfile } from "../actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserCircle2, Briefcase, MapPin, GraduationCap, Lock, Heart, MessageSquare, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ProfileForm({ profile, answers, isVerified }: any) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [jobs, setJobs] = useState<any[]>(profile.job_history || []);
  const [edu, setEdu] = useState<any[]>(profile.higher_education || []);

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

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <form action={updateProfile} className="space-y-8 relative">
      <input type="hidden" name="job_history" value={JSON.stringify(jobs)} />
      <input type="hidden" name="higher_education" value={JSON.stringify(edu)} />

      {/* STEP PROGRESS BAR */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${step >= s ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'}`}>
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
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
              <select name="account_type" defaultValue={profile.account_type || "Alumni"} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-medium">
                <option value="Alumni">Alumnus / Former Student</option>
                <option value="Faculty">Faculty Member</option>
                <option value="Student">Current Student</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2">Professional Bio & Message to Koharians</Label>
              <Textarea name="bio" defaultValue={profile.bio || ""} placeholder="A short bio about yourself, or leave a legacy message/advice for other Koharians here!" rows={4} className="rounded-xl bg-slate-50 border-slate-200 resize-none" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Languages Spoken</Label>
              <Input name="languages" defaultValue={profile.languages?.join(", ") || ""} placeholder="e.g. English, Urdu, Pashto (comma separated)" className="rounded-xl bg-slate-50" />
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
            
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500"/> Milestones & Memories</Label>
              <Textarea name="achievements" defaultValue={profile.achievements || ""} placeholder="Who was your favorite teacher? Were you sports captain or debate winner? List your BRC and after-BRC achievements here!" rows={4} className="rounded-xl bg-slate-50 resize-none" />
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
                     <Input placeholder="Institution Name" value={ed.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} className="bg-white" />
                     <Input placeholder="Degree (e.g. BS, Masters)" value={ed.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} className="bg-white" />
                     <Input placeholder="Field of Study" value={ed.field} onChange={(e) => updateEdu(i, "field", e.target.value)} className="bg-white" />
                     <div className="flex gap-2">
                       <Input placeholder="Start Year" value={ed.start_date} onChange={(e) => updateEdu(i, "start_date", e.target.value)} className="bg-white" />
                       <Input placeholder="End Year" value={ed.end_date} onChange={(e) => updateEdu(i, "end_date", e.target.value)} className="bg-white" />
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
                     <Input placeholder="Company Name" value={job.company} onChange={(e) => updateJob(i, "company", e.target.value)} className="bg-white" />
                     <Input placeholder="Job Title" value={job.title} onChange={(e) => updateJob(i, "title", e.target.value)} className="bg-white" />
                     <div className="flex gap-2">
                       <Input placeholder="Start Date/Year" value={job.start_date} onChange={(e) => updateJob(i, "start_date", e.target.value)} className="bg-white" />
                       <Input placeholder="End Date/Year" value={job.end_date} onChange={(e) => updateJob(i, "end_date", e.target.value)} className="bg-white" />
                     </div>
                   </div>
                 </div>
               ))}
            </div>

          </CardContent>
        </Card>
      )}

      {/* STEP 4: LOCATION & CONTACT */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <Card className="rounded-3xl shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-primary" /> Step 4: Location & Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label>Current City</Label><Input name="current_city" defaultValue={profile.current_city || ""} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Current Country</Label><Input name="current_country" defaultValue={profile.current_country || ""} className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2"><Label>Home District (Origin)</Label><Input name="home_district" defaultValue={profile.home_district || ""} placeholder="e.g. Loralai" className="rounded-xl bg-slate-50" /></div>
              
              <div className="space-y-2"><Label>Phone Number</Label><Input name="phone_number" defaultValue={profile.phone || ""} type="tel" className="rounded-xl bg-slate-50" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>LinkedIn URL</Label><Input name="linkedin_url" defaultValue={profile.linkedin_url || ""} type="url" className="rounded-xl bg-slate-50" /></div>
              
              <div className="sm:col-span-2 flex flex-col gap-3 mt-4">
                 <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <Checkbox id="show_phone" name="show_phone" defaultChecked={profile.show_phone_publicly} />
                    <Label htmlFor="show_phone" className="font-semibold text-slate-700 cursor-pointer">Make Phone Number visible to verified alumni</Label>
                 </div>
                 <div className="flex items-center space-x-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <Checkbox id="available_for_mentoring" name="available_for_mentoring" defaultChecked={profile.available_for_mentoring} />
                    <Label htmlFor="available_for_mentoring" className="font-bold text-emerald-900 cursor-pointer">I am available to mentor junior alumni</Label>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">Note: Your Email and LinkedIn are automatically visible to verified alumni to facilitate networking.</p>
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
        <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1} className="rounded-xl px-6 h-12 font-bold gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        
        {step < totalSteps ? (
          <Button type="button" onClick={nextStep} className="rounded-xl px-8 h-12 font-bold gap-2 bg-primary text-white hover:bg-blue-900 shadow-md">
            Next Step <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" className="rounded-xl px-10 h-12 font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl hover:scale-105 transition-all">
            Save Profile
          </Button>
        )}
      </div>
    </form>
  );
}