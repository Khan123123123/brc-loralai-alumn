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
  const isAdmin = user?.email?.toLowerCase() === adminEmail || user?.email === "qaisrani12116@gmail.com";

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-50 text-slate-900`}>
        <div className="min-h-screen flex flex-col">
          {/* Made relative on mobile, sticky only on desktop so it doesn't consume screen space */}
          <header className="relative lg:sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
              <Link href={user ? "/directory" : "/"} className="flex items-center gap-3 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-none text-primary">
                    BRC Loralai
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Alumni Network
                  </div>
                </div>
              </Link>

              {!user ? (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-secondary text-primary hover:bg-yellow-500">Join Network</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex overflow-x-auto pb-1 lg:pb-0 items-center gap-2 scrollbar-hide w-full lg:w-auto">
                  <Link href="/" className="shrink-0">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                      <Home className="h-4 w-4" /> Home
                    </Button>
                  </Link>

                  <Link href="/directory" className="shrink-0">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                      <Search className="h-4 w-4" /> Directory
                    </Button>
                  </Link>

                  <Link href="/profile/me" className="shrink-0">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                      <User className="h-4 w-4" /> Profile
                    </Button>
                  </Link>

                  <Link href="/profile/complete" className="shrink-0">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                      <Settings className="h-4 w-4" /> Edit
                    </Button>
                  </Link>

                  {isAdmin && (
                    <Link href="/admin" className="shrink-0">
                      <Button variant="ghost" size="sm" className="gap-2 text-primary font-semibold bg-blue-50">
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Button>
                    </Link>
                  )}

                  <form action="/auth/signout" method="get" className="shrink-0 ml-auto lg:ml-2">
                    <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" type="submit">
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {user && (
              <div className="border-t bg-slate-100 hidden lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-1.5 text-xs">
                  <div className="text-slate-500">
                    Signed in as <span className="font-semibold text-slate-900">{profile?.full_name || user.email}</span>
                  </div>
                  <div className="text-slate-500">
                    Status: <span className="font-medium capitalize text-primary">{profile?.verification_status || "incomplete"}</span>
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