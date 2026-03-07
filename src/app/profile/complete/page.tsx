"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateProfileScore, getVerificationStatus, hasFullAccess } from "@/lib/utils/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Linkedin, Award, BookOpen, Users, Building, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";

const districts = ["Loralai", "Qila Saifullah", "Zhob", "Barkhan", "Musakhel", "Duki", "Quetta", "Pishin", "Other"];
const studentTypes = ["Hostelite", "Day Scholar"];
const financeTypes = ["Regular", "Self-Finance"];
const employmentStatuses = ["Employed", "Self-Employed", "Business Owner", "Student", "Retired", "Not Working", "House Wife/Husband"];
const languages = ["Balochi", "Pashto", "Urdu", "English", "Punjabi", "Sindhi", "Brahvi", "Other"];
const industries = [
  "Healthcare/Medical", "IT/Software/Technology", "Education/Teaching", 
  "Government/Public Sector", "Business/Trade", "Banking/Finance", 
  "Engineering", "Law/Legal", "Media/Journalism", "Agriculture", 
  "Military/Defense", "Real Estate", "Transportation", "Construction", 
  "Mining", "Other"
];

export default function CompleteProfilePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
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
    languages: [] as string[], 
    bio: "", 
    achievements: "",
    featured_in_presentation: false, 
    available_for_mentoring: false,
    verification_answers: { 
      houses: "", 
      teachers: "", 
      staff: "", 
      principal: "",
      established_year: ""
    }
  });

  useEffect(() => { 
    checkUser(); 
  }, []);
  
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      router.push("/auth/login"); 
      return; 
    }
    setUser(user);
    
    // Load existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      setExistingProfile(profile);
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
        verification_answers: profile.verification_answers || { 
          houses: "", teachers: "", staff: "", principal: "", established_year: "" 
        }
      });
      
      // If already full access, redirect to profile
      if (hasFullAccess(profile.verification_status)) {
        router.push("/profile/me");
      }
    }
  };

  const currentScore = calculateProfileScore({ ...formData });
  const status = getVerificationStatus(currentScore);
  const isFullyVerified = status === 'full';
  
  const updateVerification = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      verification_answers: { ...prev.verification_answers, [field]: value } 
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const score = currentScore;
      const finalStatus = getVerificationStatus(score);
      
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: formData.full_name,
        entry_year: parseInt(formData.entry_year) || null,
        graduation_year: parseInt(formData.graduation_year) || null,
        home_district: formData.home_district || null,
        student_type: formData.student_type || null,
        regular_self_finance: formData.regular_self_finance || null,
        roll_number: formData.roll_number || null,
        current_country: formData.current_country || "Pakistan",
        current_city: formData.current_city,
        current_position: formData.current_position,
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
        verification_answers: formData.verification_answers,
        verification_score: score,
        verification_status: finalStatus,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) throw error;
      
      if (isFullyVerified) {
        alert("🎉 Congratulations! Your profile is verified. You now have FULL access to the alumni directory!");
        router.push("/directory");
      } else {
        alert("Profile saved! Your verification score is " + score + "/100. You need 70+ for full access. Improve your answers or wait for admin approval.");
        // Stay on page, don't redirect
      }
      
      router.refresh();
    } catch (error: any) { 
      console.error("Error:", error);
      alert("Error: " + error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const renderProgressBar = () => (
    <div className="bg-gray-50 p-4 rounded-lg border mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">Verification Score: {currentScore}/100</span>
        <span className={`px-4 py-1 rounded-full text-sm font-bold ${
          isFullyVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isFullyVerified ? '✓ FULL ACCESS' : '⏳ PENDING'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${isFullyVerified ? 'bg-green-500' : 'bg-yellow-500'}`} 
          style={{ width: `${currentScore}%` }} 
        />
      </div>
      {!isFullyVerified && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">You need {70 - currentScore} more points for full access</p>
            <p>Answer verification questions correctly or contact admin for manual approval.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Complete Your Profile</span>
            </div>
            <CardTitle className="text-2xl">
              Step {step === 4 ? "3" : step} of 3: {
                step === 1 ? "BRC College Details" : 
                step === 2 ? "Professional Information" : 
                "Identity Verification"
              }
            </CardTitle>
            <CardDescription className="text-blue-100">
              You need 70+ points for full directory access
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            {renderProgressBar()}

            {/* STEP 1: BRC Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Full Name *
                    </Label>
                    <Input 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      placeholder="As per BRC records"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Roll Number (Optional)</Label>
                    <Input 
                      value={formData.roll_number} 
                      onChange={e => setFormData({...formData, roll_number: e.target.value})}
                      placeholder="e.g., BRC-2010-123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entry Year (Class 6) *</Label>
                    <Select 
                      value={formData.entry_year} 
                      onValueChange={v => setFormData({...formData, entry_year: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 45}, (_, i) => 1980 + i).map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Graduation Year *</Label>
                    <Select 
                      value={formData.graduation_year} 
                      onValueChange={v => setFormData({...formData, graduation_year: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 45}, (_, i) => 1984 + i).map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Student Type *</Label>
                    <Select 
                      value={formData.student_type} 
                      onValueChange={v => setFormData({...formData, student_type: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {studentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Finance Type</Label>
                    <Select 
                      value={formData.regular_self_finance} 
                      onValueChange={v => setFormData({...formData, regular_self_finance: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {financeTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Home District *</Label>
                    <Select 
                      value={formData.home_district} 
                      onValueChange={v => setFormData({...formData, home_district: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Professional Info */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Current City *
                    </Label>
                    <Input 
                      value={formData.current_city} 
                      onChange={e => setFormData({...formData, current_city: e.target.value})}
                      placeholder="e.g., Quetta, Karachi, Dubai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Country</Label>
                    <Input 
                      value={formData.current_country} 
                      onChange={e => setFormData({...formData, current_country: e.target.value})}
                      placeholder="e.g., Pakistan, UAE, UK"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4" /> Current Position/Job Title *
                  </Label>
                  <Input 
                    value={formData.current_position} 
                    onChange={e => setFormData({...formData, current_position: e.target.value})}
                    placeholder="e.g., Software Engineer, Doctor, Business Owner"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profession/Field</Label>
                  <Input 
                    value={formData.profession} 
                    onChange={e => setFormData({...formData, profession: e.target.value})}
                    placeholder="e.g., Engineering, Medicine, Teaching"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Organization/Company</Label>
                  <Input 
                    value={formData.current_organization} 
                    onChange={e => setFormData({...formData, current_organization: e.target.value})}
                    placeholder="Organization name or Self-employed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={v => setFormData({...formData, industry: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <Select 
                      value={formData.employment_status} 
                      onValueChange={v => setFormData({...formData, employment_status: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {employmentStatuses.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (Years)</Label>
                    <Input 
                      type="number"
                      value={formData.experience_years} 
                      onChange={e => setFormData({...formData, experience_years: e.target.value})}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number
                  </Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn URL
                  </Label>
                  <Input 
                    value={formData.linkedin_url} 
                    onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Short Bio
                  </Label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself, your journey after BRC..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="w-4 h-4" /> Achievements & Awards
                  </Label>
                  <Textarea 
                    value={formData.achievements} 
                    onChange={e => setFormData({...formData, achievements: e.target.value})}
                    placeholder="Notable achievements in your career or education..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages You Speak</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {languages.map(lang => (
                      <div key={lang} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                        <Checkbox 
                          checked={formData.languages.includes(lang)} 
                          onCheckedChange={c => setFormData({
                            ...formData, 
                            languages: c ? [...formData.languages, lang] : formData.languages.filter(l => l !== lang)
                          })} 
                        />
                        <span className="text-sm">{lang}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                  <Checkbox 
                    checked={formData.available_for_mentoring} 
                    onCheckedChange={c => setFormData({...formData, available_for_mentoring: c as boolean})} 
                  />
                  <Label className="font-medium">Available for mentoring other Koharians</Label>
                </div>
              </div>
            )}

            {/* STEP 3: Verification Questions */}
            {step === 3 && (
              <div className="space-y-5 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-xl text-blue-900">Identity Verification</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Answer these correctly for instant approval (70+ points)!
                </p>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="font-semibold text-gray-800 mb-2 block">
                      1. Name at least 2 House names of BRC Hostel *
                    </Label>
                    <Textarea 
                      value={formData.verification_answers.houses} 
                      onChange={e => updateVerification('houses', e.target.value)} 
                      placeholder="e.g., Jinnah House, Iqbal House..."
                      rows={2}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Valid: Jinnah, Iqbal, Liaquat, Fatima, Quaid</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="font-semibold text-gray-800 mb-2 block">
                      2. Name 2-3 teachers who taught at BRC *
                    </Label>
                    <Textarea 
                      value={formData.verification_answers.teachers} 
                      onChange={e => updateVerification('teachers', e.target.value)} 
                      placeholder="e.g., Mr. Khan (Math), Sir Ahmed (English)..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="font-semibold text-gray-800 mb-2 block">
                      3. Name any staff member, peon, mess worker or warden *
                    </Label>
                    <Textarea 
                      value={formData.verification_answers.staff} 
                      onChange={e => updateVerification('staff', e.target.value)} 
                      placeholder="e.g., Ghulam Nabi (Mess), Security Guard..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="font-semibold text-gray-800 mb-2 block">
                      4. Who was/is the Principal or Headmaster of BRC?
                    </Label>
                    <Textarea 
                      value={formData.verification_answers.principal} 
                      onChange={e => updateVerification('principal', e.target.value)} 
                      placeholder="Current or past principal name..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="font-semibold text-gray-800 mb-2 block">
                      5. In which year was BRC Loralai established? (Hint: Early 1980s)
                    </Label>
                    <Input 
                      value={formData.verification_answers.established_year} 
                      onChange={e => updateVerification('established_year', e.target.value)} 
                      placeholder="e.g., 1982"
                      className="mt-1"
                    />
                  </div>
                </div>

                {isFullyVerified ? (
                  <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Perfect! Your answers look correct.</p>
                    <p className="text-sm">You'll get FULL ACCESS immediately!</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 p-4 rounded-lg">
                    <AlertCircle className="w-6 h-6 inline mr-2" />
                    <span className="font-medium">Current Score: {currentScore}/100</span>
                    <p className="text-sm mt-1">Answer all questions correctly to reach 70 points</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t mt-6">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="px-6">
                  ← Back
                </Button>
              ) : <div />}
              
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700 px-6">
                  Next →
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className={`px-8 py-6 text-lg ${isFullyVerified ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                  {loading ? "Saving..." : isFullyVerified ? "✓ Get Full Access" : "Submit for Review"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}