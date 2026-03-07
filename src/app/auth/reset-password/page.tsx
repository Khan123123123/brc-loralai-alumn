"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Your password reset session is missing or expired. Please request a new reset link.");
      }
      setCheckingSession(false);
    };

    check();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Password updated successfully. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card className="rounded-3xl border-0 shadow-xl">
            <CardContent className="p-10 text-center text-slate-500">
              Preparing secure password reset...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Reset password
            </CardTitle>
            <CardDescription className="text-base">
              Choose a new password for your alumni account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-5">
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
                <Label htmlFor="password">New password</Label>
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
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating password..." : "Update password"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                <CheckCircle2 className="h-4 w-4" />
                Security tip
              </div>
              <p>
                Use a strong password that you do not reuse on other sites.
              </p>
            </div>

            <div className="mt-5 text-center text-sm text-slate-600">
              <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}