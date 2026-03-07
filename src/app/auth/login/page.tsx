"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Users, Search, UserCircle2 } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        router.push("/auth/login");
        router.refresh();
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, is_profile_complete")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.is_profile_complete) {
        router.push("/profile/complete");
      } else {
        router.push("/directory");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="hidden rounded-3xl bg-slate-900 p-10 text-white shadow-xl lg:block">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
            <ShieldCheck className="h-4 w-4" />
            Trusted alumni-only network
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Welcome back to the BRC Loralai Alumni Network
          </h1>

          <p className="mt-5 text-lg text-slate-300">
            Sign in to reconnect with Koharians, browse the alumni directory, and manage your profile and privacy settings.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-200">
              <Users className="h-5 w-5" />
              <span>Explore the alumni community</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <Search className="h-5 w-5" />
              <span>Search by batch, city, district, and profession</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <UserCircle2 className="h-5 w-5" />
              <span>Control what contact details are public</span>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md rounded-3xl border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Sign in
            </CardTitle>
            <CardDescription className="text-base">
              Access the alumni directory and your member profile
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-5 space-y-3 text-center text-sm text-slate-600">
              <Link href="/auth/forgot-password" className="font-medium text-slate-900 hover:underline">
                Forgot your password?
              </Link>

              <div>
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-slate-900 hover:underline">
                  Create one
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}