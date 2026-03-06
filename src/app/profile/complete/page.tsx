"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateProfileScore, getVerificationStatus } from "@/lib/utils/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const programs = ["FSc Pre-Medical", "FSc Pre-Engineering", "ICS", "I.Com", "FA", "BA", "BSc", "BCom", "MA", "MSc", "Other"];
const districts = ["Loralai", "Qila Saifullah", "Zhob", "Barkhan", "Musakhel", "Quetta", "Other"];
const industries = ["Healthcare", "IT", "Education", "Government", "Business", "Banking", "Engineering", "Law", "Media", "Agriculture", "Military", "Other"];
const employmentStatuses = ["Employed", "Self-Employed", "Business Owner", "Student", "Retired", "Not Working"];
const languages = ["Balochi", "Pashto", "Urdu", "English", "Punjabi", "Sindhi", "Other"];

export default function CompleteProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: "", entry_year: "", graduation_year: "", program: "", education_level: "",
    regular_self_finance: "", roll_number: "", home_district: "", student_type: "",
    current_country: "", current_city: "", current_position: "", profession: "",
    current_organization: "", industry: "", experience_years: "", employment_status: "",
    phone: "", linkedin_url: "", languages: [] as string[], bio: "", achievements: "",
    featured_in_presentation: false, available_for_mentoring: false,
    verification_answers: { houses: "", teachers: "", staff: "", ghulam_nabi: "" }
  });

  useEffect(() => { checkUser(); }, []);
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    setUser(user);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      setFormData({
        ...formData, ...profile,
        entry_year: profile.entry_year?.toString() || "",
        graduation_year: profile.graduation_year?.toString() || "",
        experience_years: profile.experience_years?.toString() || "",
        verification_answers: profile.verification_answers || { houses: "", teachers: "", staff: "", ghulam_nabi: "" }
      });
    }
  };

  const currentScore = calculateProfileScore({ ...formData, verified_by_peers: 0 });
  const updateVerification = (field: string, value: string) => setFormData(prev => ({ ...prev, verification_answers: { ...prev.verification_answers, [field]: value } }));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const score = currentScore;
      const status = getVerificationStatus(score);
      const profileData = {
        id: user.id, email: user.email, full_name: formData.full_name,
        entry_year: parseInt(formData.entry_year), graduation_year: parseInt(formData.graduation_year),
        program: formData.program, education_level: formData.education_level || null,
        regular_self_finance: formData.regular_self_finance || null, roll_number: formData.roll_number || null,
        home_district: formData.home_district || null, student_type: formData.student_type || null,
        current_country: formData.current_country || null, current_city: formData.current_city,
        current_position: formData.current_position, profession: formData.profession || null,
        current_organization: formData.current_organization || null, industry: formData.industry || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        employment_status: formData.employment_status || null, phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null, languages: formData.languages,
        bio: formData.bio || null, achievements: formData.achievements || null,
        featured_in_presentation: formData.featured_in_presentation, available_for_mentoring: formData.available_for_mentoring,
        verification_answers: formData.verification_answers, verification_score: score,
        verification_status: status, needs_admin_review: score < 50, auto_approved: score >= 70,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) throw error;
      router.push("/profile/me");
      router.refresh();
    } catch (error: any) { alert("Error: " + error.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Step {step === 5 ? "4" : step} of 4: {step === 1 ? "College Details" : step === 2 ? "Professional Details" : step === 3 ? "Contact & Preferences" : step === 4 ? "Achievements" : "Verification"}</CardTitle>
            <CardDescription className="text-blue-100">Complete your profile to join BRC Loralai Alumni Network</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Verification Score: {currentScore}/100</span>
                <span className={`px-3 py-1 rounded-full text-sm ${currentScore >= 70 ? 'bg-green-100 text-green-800' : currentScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {currentScore >= 70 ? 'Full Access' : currentScore >= 50 ? 'Basic Access' : 'Pending'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${currentScore >= 70 ? 'bg-green-500' : currentScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${currentScore}%` }} /></div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name *</Label><Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Roll Number</Label><Input value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} placeholder="Optional" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Entry Year *</Label><Select value={formData.entry_year} onValueChange={v => setFormData({...formData, entry_year: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{Array.from({length: 50}, (_, i) => 1980 + i).map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Graduation Year *</Label><Select value={formData.graduation_year} onValueChange={v => setFormData({...formData, graduation_year: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{Array.from({length: 50}, (_, i) => 1984 + i).map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Program at BRC *</Label><Select value={formData.program} onValueChange={v => setFormData({...formData, program: v})}><SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger><SelectContent>{programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Highest Education Level</Label><Input value={formData.education_level} onChange={e => setFormData({...formData, education_level: e.target.value})} placeholder="e.g., Bachelor, Master, PhD" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Regular/Self-Finance</Label><Select value={formData.regular_self_finance} onValueChange={v => setFormData({...formData, regular_self_finance: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Self-Finance">Self-Finance</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Student Type</Label><Select value={formData.student_type} onValueChange={v => setFormData({...formData, student_type: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Hostelite">Hostelite</SelectItem><SelectItem value="Day Scholar">Day Scholar</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Home District *</Label><Select value={formData.home_district} onValueChange={v => setFormData({...formData, home_district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Current Country</Label><Input value={formData.current_country} onChange={e => setFormData({...formData, current_country: e.target.value})} placeholder="e.g., Pakistan, UAE, UK" /></div>
                  <div className="space-y-2"><Label>Current City *</Label><Input value={formData.current_city} onChange={e => setFormData({...formData, current_city: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Current Position/Job Title *</Label><Input value={formData.current_position} onChange={e => setFormData({...formData, current_position: e.target.value})} /></div>
                <div className="space-y-2"><Label>Profession</Label><Input value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} placeholder="e.g., Doctor, Engineer, Teacher" /></div>
                <div className="space-y-2"><Label>Current Organization</Label><Input value={formData.current_organization} onChange={e => setFormData({...formData, current_organization: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Industry</Label><Select value={formData.industry} onValueChange={v => setFormData({...formData, industry: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Employment Status</Label><Select value={formData.employment_status} onValueChange={v => setFormData({...formData, employment_status: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{employmentStatuses.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Years of Experience</Label><Input type="number" value={formData.experience_years} onChange={e => setFormData({...formData, experience_years: e.target.value})} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Phone Number</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+92 300 1234567" /></div>
                <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={formData.linkedin_url} onChange={e => setFormData({...formData, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/username" /></div>
                <div className="space-y-2"><Label>Languages Spoken</Label><div className="grid grid-cols-2 gap-2">{languages.map(lang => <div key={lang} className="flex items-center space-x-2"><Checkbox checked={formData.languages.includes(lang)} onCheckedChange={c => setFormData({...formData, languages: c ? [...formData.languages, lang] : formData.languages.filter(l => l !== lang)})} /><span className="text-sm">{lang}</span></div>)}</div></div>
                <div className="space-y-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Brief introduction..." rows={3} /></div>
                <div className="flex items-center space-x-2"><Checkbox checked={formData.available_for_mentoring} onCheckedChange={c => setFormData({...formData, available_for_mentoring: c as boolean})} /><Label>Available for mentoring other Koharians</Label></div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Achievements (For Presentation)</Label><Textarea value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="Describe your achievements during and after BRC life..." rows={4} /></div>
                <div className="flex items-center space-x-2"><Checkbox checked={formData.featured_in_presentation} onCheckedChange={c => setFormData({...formData, featured_in_presentation: c as boolean})} /><Label>Feature me in the presentation during alumni event</Label></div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-blue-900">BRC Verification Questions (Answer to increase score!)</h3>
                <div className="space-y-2"><Label>1. Name at least 2 Houses of BRC (Boys Hostel)</Label><Textarea value={formData.verification_answers.houses} onChange={e => updateVerification('houses', e.target.value)} placeholder="e.g., Quaid House, Iqbal House..." rows={2} /></div>
                <div className="space-y-2"><Label>2. Name 2-3 teachers with their subjects</Label><Textarea value={formData.verification_answers.teachers} onChange={e => updateVerification('teachers', e.target.value)} placeholder="e.g., Mr. Ahmed (Physics)..." rows={2} /></div>
                <div className="space-y-2"><Label>3. Name 2-3 staff members or mess workers</Label><Textarea value={formData.verification_answers.staff} onChange={e => updateVerification('staff', e.target.value)} placeholder="e.g., peon Muhammad..." rows={2} /></div>
                <div className="space-y-2"><Label>4. Who is/was Ghulam Nabi?</Label><Textarea value={formData.verification_answers.ghulam_nabi} onChange={e => updateVerification('ghulam_nabi', e.target.value)} placeholder="Share what you know..." rows={2} /></div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>← Back</Button> : <div />}
              {step < 5 ? <Button onClick={() => setStep(step + 1)} className="bg-blue-600">Next →</Button> : <Button onClick={handleSubmit} disabled={loading} className="bg-green-600">{loading ? "Saving..." : "Complete Profile"}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
