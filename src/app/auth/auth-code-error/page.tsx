import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Authentication error
            </CardTitle>
            <CardDescription className="text-base">
              The sign-in or recovery link is invalid, incomplete, or has expired
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-sm text-slate-600">
              Please try signing in again, or request a fresh password reset link.
            </p>

            <div className="grid gap-3">
              <Link href="/auth/login">
                <Button className="w-full">Go to sign in</Button>
              </Link>

              <Link href="/auth/forgot-password">
                <Button variant="outline" className="w-full">
                  Reset password again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}