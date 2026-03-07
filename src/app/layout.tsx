import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Users,
  Home,
  Search,
  User,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BRC Loralai Alumni Network",
  description:
    "Connecting Koharians worldwide - Alumni network for Balochistan Residential College, Loralai",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: {
    full_name?: string | null;
    verification_status?: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, verification_status")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const isAdmin = user?.email?.toLowerCase() === adminEmail;

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-50 text-slate-900`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href={user ? "/directory" : "/"} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold leading-none">
                    BRC Loralai Alumni
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Koharians Worldwide
                  </div>
                </div>
              </Link>

              {!user ? (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Join Network</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/">
                    <Button variant="ghost" className="gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </Link>

                  <Link href="/directory">
                    <Button variant="ghost" className="gap-2">
                      <Search className="h-4 w-4" />
                      Directory
                    </Button>
                  </Link>

                  <Link href="/profile/me">
                    <Button variant="ghost" className="gap-2">
                      <User className="h-4 w-4" />
                      My Profile
                    </Button>
                  </Link>

                  <Link href="/profile/complete">
                    <Button variant="ghost" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>

                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}

                  <form action="/auth/signout" method="get">
                    <Button variant="outline" className="gap-2" type="submit">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {user && (
              <div className="border-t bg-slate-50">
                <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2 text-sm sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
                  <div className="text-slate-600">
                    Signed in as{" "}
                    <span className="font-semibold text-slate-900">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Status:{" "}
                    <span className="font-medium capitalize text-slate-700">
                      {profile?.verification_status || "incomplete"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
              <p>© 2026 BRC Loralai Alumni Network</p>
              <p>Connecting Koharians worldwide</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}