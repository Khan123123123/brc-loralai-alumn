import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAnnouncement, deleteAnnouncement, toggleAnnouncementStatus } from "../action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Power, Megaphone, ArrowLeft } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const userEmail = user?.email?.toLowerCase() || "";
  const isAdmin = userEmail && (userEmail === adminEnvEmail || userEmail === "qaisrani12116@gmail.com" || userEmail === "brcloralai123@gmail.com");

  if (!isAdmin) {
    redirect("/directory");
  }

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" /> Manage Announcements
          </h1>
          <p className="text-slate-500 mt-1">Post urgent alerts, news, or events directly to the Directory.</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Profile Approvals
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* POST NEW ANNOUNCEMENT FORM */}
        <div className="md:col-span-1">
          <Card className="rounded-2xl border shadow-sm sticky top-8">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg">New Notice</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={createAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select name="type" className="w-full h-10 px-3 rounded-lg border text-sm" required>
                    <option value="News">General News</option>
                    <option value="Event">Upcoming Event</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" required placeholder="e.g. Islamabad Reunion 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea name="content" required placeholder="Details..." rows={4} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label>External Link (Optional)</Label>
                  <Input name="link_url" type="url" placeholder="https://..." />
                </div>
                <button type="submit" className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 transition-colors">
                  Post to Directory
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* EXISTING ANNOUNCEMENTS LIST */}
        <div className="md:col-span-2 space-y-4">
          {announcements?.length === 0 ? (
             <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed text-slate-500">No announcements posted yet.</div>
          ) : (
            announcements?.map((ann) => (
              <Card key={ann.id} className={`rounded-2xl transition-all ${!ann.is_active ? 'opacity-50 grayscale' : 'shadow-sm'}`}>
                <CardContent className="p-5 flex gap-4 items-start justify-between">
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        ann.type === 'Urgent' ? 'bg-red-100 text-red-700' : ann.type === 'Event' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{ann.type}</span>
                      <span className="text-xs text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg">{ann.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                    {ann.link_url && <a href={ann.link_url} className="text-xs text-primary font-bold mt-2 inline-block hover:underline" target="_blank">Attached Link &rarr;</a>}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <form action={toggleAnnouncementStatus.bind(null, ann.id, ann.is_active)}>
                      <button type="submit" className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50" title={ann.is_active ? "Deactivate" : "Activate"}>
                        <Power className="w-4 h-4" />
                      </button>
                    </form>
                    <form action={deleteAnnouncement.bind(null, ann.id)}>
                      <button type="submit" className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50" title="Delete Permanent">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}