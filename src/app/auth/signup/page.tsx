"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailCheck, ShieldCheck, Users } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/profile/complete`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists.");
      } else {
        setMessage("Account created. Please check your email and confirm your address.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-xl lg:block">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
            <Users className="h-4 w-4" />
            Join the Koharians community
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Build your alumni profile and reconnect with BRC Loralai
          </h1>

          <p className="mt-5 text-lg text-slate-300">
            Create your account, complete your alumni profile, and unlock verified member access after approval.
          </p>

          <div className="mt-8 space-y-4 text-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Privacy controls for phone, email, and LinkedIn</span>
            </div>
            <div className="flex items-center gap-3">
              <MailCheck className="h-5 w-5" />
              <span>Email confirmation for account security</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <span>Browse alumni even before full approval with limited access</span>
            </div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md rounded-3xl border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Create account
            </CardTitle>
            <CardDescription className="text-base">
              Start your BRC Loralai alumni membership
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}