import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Globe,
  GraduationCap,
  ShieldCheck,
  Search,
  UserCircle,
} from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("verification_status, current_country");

  const totalAlumni = profiles?.length || 0;
  const verifiedAlumni =
    profiles?.filter((p) => p.verification_status === "full").length || 0;
  const countries = new Set(
    (profiles || []).map((p) => p.current_country).filter(Boolean)
  ).size;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            Balochistan Residential College, Loralai
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            The digital home for Koharians everywhere
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Reconnect with classmates, discover alumni by city or profession,
            build mentorship links, and keep the BRC community alive across the world.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signup">
              <Button size="lg">Join the Network</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Member Login
              </Button>
            </Link>
            <Link href="/directory">
              <Button size="lg" variant="ghost">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <Users className="mb-3 h-8 w-8 text-slate-700" />
              <div className="text-3xl font-bold">{totalAlumni}+</div>
              <p className="mt-2 text-sm text-slate-500">Registered alumni</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <ShieldCheck className="mb-3 h-8 w-8 text-slate-700" />
              <div className="text-3xl font-bold">{verifiedAlumni}+</div>
              <p className="mt-2 text-sm text-slate-500">Verified members</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <Globe className="mb-3 h-8 w-8 text-slate-700" />
              <div className="text-3xl font-bold">{countries || 1}+</div>
              <p className="mt-2 text-sm text-slate-500">Countries represented</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <GraduationCap className="mb-3 h-8 w-8 text-slate-700" />
              <div className="text-3xl font-bold">40+</div>
              <p className="mt-2 text-sm text-slate-500">Years of BRC legacy</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <UserCircle className="mb-4 h-8 w-8 text-slate-700" />
            <h3 className="text-lg font-semibold">Create your alumni profile</h3>
            <p className="mt-2 text-sm text-slate-600">
              Add your batch, district, profession, organization, location, and alumni story.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <ShieldCheck className="mb-4 h-8 w-8 text-slate-700" />
            <h3 className="text-lg font-semibold">Get verified</h3>
            <p className="mt-2 text-sm text-slate-600">
              Use profile details and BRC-specific questions to ensure trusted access.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <Search className="mb-4 h-8 w-8 text-slate-700" />
            <h3 className="text-lg font-semibold">Find and reconnect</h3>
            <p className="mt-2 text-sm text-slate-600">
              Search by city, profession, district, batch, or industry and rebuild connections.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}