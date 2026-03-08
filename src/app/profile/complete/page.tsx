import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile } from "../actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserCircle2, Briefcase, MapPin, GraduationCap, Link as LinkIcon, Lock, Globe, ShieldCheck, Heart, MessageSquare } from "lucide-react";

export default async function CompleteProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  
  if (!profile) redirect("/auth/login");

  const isVerified = profile.verification_status === "full" || profile.admin_status === "approved" || profile.access_level === "full";
  const answers = profile.verification_answers || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {profile.is_profile_complete ? "Edit Your Profile" : "Complete Your Profile"}
        </h1>
        <p className="mt-2 text-slate-600">Update your information to connect with fellow Koharians worldwide.</p>
        
        {isVerified && (
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5" /> Your account is officially verified.
          </div>
        )}
      </div>

      <form action={updateProfile} className="space-y-8">
        
        {/* BASIC INFO */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><UserCircle2 className="w-5 h-5 text-primary" /> Basic Information</CardTitle>
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
              <Label>Professional Bio</Label>
              <Textarea name="bio" defaultValue={profile.bio || ""} placeholder="A short bio about yourself..." rows={3} className="rounded-xl bg-slate-50 border-slate-200 resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* BRC DETAILS & ENGAGING INFO */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="w-5 h-5 text-primary" /> Koharian Experience & Memories</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Entry Year (Optional)</Label>
              <Input name="entry_year" type="number" defaultValue={profile.entry_year || ""} placeholder="e.g. 2005" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input name="graduation_year" type="number" defaultValue={profile.graduation_year || ""} placeholder="e.g. 2010" className="rounded-xl bg-slate-50" />
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500"/> Favorite Teacher at BRC</Label>
              <Input name="favorite_teacher" defaultValue={profile.favorite_teacher || ""} placeholder="Who inspired you the most?" className="rounded-xl bg-slate-50" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Achievements during BRC</Label>
              <Textarea name="achievements_brc" defaultValue={profile.achievements_brc || ""} placeholder="Sports captain, debate winner, house prefect..." rows={2} className="rounded-xl bg-slate-50 resize-none" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Achievements After BRC</Label>
              <Textarea name="achievements_after" defaultValue={profile.achievements_after || ""} placeholder="Degrees, awards, major career milestones..." rows={2} className="rounded-xl bg-slate-50 resize-none" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-500"/> Message for other Koharians</Label>
              <Textarea name="message_for_koharians" defaultValue={profile.message_for_koharians || ""} placeholder="Leave a legacy message or piece of advice for the network..." rows={2} className="rounded-xl bg-slate-50 resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* PROFESSIONAL */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="w-5 h-5 text-primary" /> Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
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
              <Input name="profession" defaultValue={profile.profession || ""} placeholder="e.g. Software Engineer, Doctor" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Industry Field</Label>
              <Input name="industry" defaultValue={profile.industry || ""} placeholder="e.g. IT, Healthcare, Government" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500"/> Languages Spoken</Label>
              <Input name="languages" defaultValue={profile.languages?.join(", ") || ""} placeholder="e.g. English, Urdu, Pashto (comma separated)" className="rounded-xl bg-slate-50" />
            </div>
          </CardContent>
        </Card>

        {/* LOCATION & CONTACT */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b rounded-t-3xl pb-4">
            <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-primary" /> Location & Contact</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Current City</Label>
              <Input name="current_city" defaultValue={profile.current_city || ""} placeholder="Where do you live now?" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Current Country</Label>
              <Input name="current_country" defaultValue={profile.current_country || ""} className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Home City</Label>
              <Input name="home_city" defaultValue={profile.home_city || ""} placeholder="Where are you originally from?" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Home District</Label>
              <Input name="home_district" defaultValue={profile.home_district || ""} placeholder="e.g. Loralai, Quetta" className="rounded-xl bg-slate-50" />
            </div>
            
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="phone_number" defaultValue={profile.phone_number || ""} type="tel" className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn Profile URL</Label>
              <Input name="linkedin_url" defaultValue={profile.linkedin_url || ""} type="url" placeholder="https://linkedin.com/in/..." className="rounded-xl bg-slate-50" />
            </div>
          </CardContent>
        </Card>

        {/* VERIFICATION QUESTIONS - ONLY SHOW IF NOT VERIFIED */}
        {!isVerified && (
          <Card className="rounded-3xl shadow-sm border-amber-200 bg-amber-50/30">
            <CardHeader className="border-b border-amber-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-amber-900"><Lock className="w-5 h-5" /> Security & Verification</CardTitle>
              <CardDescription className="text-amber-800 font-medium">Please answer at least two questions to help admins verify you are a genuine Koharian.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2"><Label className="text-amber-900">Which House were you in?</Label><Input name="verify_houses" defaultValue={(answers as any)?.houses || ""} placeholder="e.g. Jinnah, Iqbal..." className="rounded-xl bg-white border-amber-200" /></div>
              <div className="space-y-2"><Label className="text-amber-900">Name two teachers from your time:</Label><Input name="verify_teachers" defaultValue={(answers as any)?.teachers || ""} className="rounded-xl bg-white border-amber-200" /></div>
              <div className="space-y-2"><Label className="text-amber-900">Name a hostel staff/guard:</Label><Input name="verify_staff" defaultValue={(answers as any)?.staff || ""} className="rounded-xl bg-white border-amber-200" /></div>
              <div className="space-y-2"><Label className="text-amber-900">Who was the Principal?</Label><Input name="verify_principal" defaultValue={(answers as any)?.principal || ""} className="rounded-xl bg-white border-amber-200" /></div>
              <div className="space-y-2 sm:col-span-2"><Label className="text-amber-900">What year was BRC established?</Label><Input name="verify_established_year" defaultValue={(answers as any)?.established_year || ""} className="rounded-xl bg-white border-amber-200" /></div>
            </CardContent>
          </Card>
        )}

        {/* PREFERENCES */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Checkbox id="show_email" name="show_email" defaultChecked={profile.show_email} />
              <Label htmlFor="show_email" className="font-semibold text-slate-700 cursor-pointer">Make Email visible to verified alumni</Label>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Checkbox id="show_phone" name="show_phone" defaultChecked={profile.show_phone} />
              <Label htmlFor="show_phone" className="font-semibold text-slate-700 cursor-pointer">Make Phone visible to verified alumni</Label>
            </div>
            <div className="flex items-center space-x-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <Checkbox id="available_for_mentoring" name="available_for_mentoring" defaultChecked={profile.available_for_mentoring} />
              <Label htmlFor="available_for_mentoring" className="font-bold text-emerald-800 cursor-pointer">Available to mentor junior alumni</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 mb-12">
          <Button type="submit" size="lg" className="rounded-full px-10 py-6 text-lg font-extrabold shadow-xl hover:scale-105 transition-all">
            Save Profile & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}