"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) throw error;

      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Forgot password
            </CardTitle>
            <CardDescription className="text-base">
              We’ll send you a secure link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleReset} className="space-y-5">
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
                <Label htmlFor="email">Your email address</Label>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                <MailCheck className="h-4 w-4" />
                What happens next?
              </div>
              <p>
                Open the email from your inbox, click the reset link, and you will be taken to a secure page to choose your new password.
              </p>
            </div>

            <div className="mt-5 text-center text-sm text-slate-600">
              Remembered your password?{" "}
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