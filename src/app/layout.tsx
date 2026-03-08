import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Users,
  Home,
  Search,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Lock,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BRC Loralai Alumni Network",
  description: "Connecting Koharians worldwide",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let isVerified = false;

  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, verification_status, admin_status, access_level").eq("id", user.id).single();
    profile = data;
    if (profile) {
      isVerified = profile.admin_status === "approved" || profile.verification_status === "full" || profile.access_level === "full";
    }
  }

  const adminEnvEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "";
  const userEmail = user?.email?.toLowerCase() || "";
  const isAdmin = userEmail && (userEmail === adminEnvEmail || userEmail === "qaisrani12116@gmail.com" || userEmail === "brcloralai123@gmail.com");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        
        <header className="relative lg:sticky top-0 z-50 border-b border-border bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
            
            <div className="flex items-center justify-between w-full lg:w-auto">
              <Link href={user ? "/directory" : "/"} className="flex items-center gap-3 shrink-0 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md group-hover:shadow-lg transition-all">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  {user && profile ? (
                    <>
                      <div className="text-[15px] font-extrabold leading-none text-primary dark:text-white flex items-center gap-1.5">
                        <span className="truncate max-w-[130px] sm:max-w-[200px]">{profile.full_name || "My Account"}</span>
                        {isVerified ? (
                          <span title="Verified" className="inline-flex items-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          </span>
                        ) : (
                          <span title="Unverified" className="inline-flex items-center">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] font-bold text-secondary uppercase tracking-widest">BRC Loralai Alumni</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold leading-none text-primary dark:text-white">BRC Loralai</div>
                      <div className="mt-1 text-[10px] font-bold text-secondary uppercase tracking-widest">Alumni Network</div>
                    </>
                  )}
                </div>
              </Link>
              
              <div className="flex lg:hidden items-center gap-2">
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-md">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Admin
                  </Link>
                )}
                <ThemeToggle />
              </div>
            </div>

            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/auth/login"><Button variant="outline" size="sm" className="rounded-full">Login</Button></Link>
                <Link href="/auth/signup"><Button size="sm" className="bg-primary text-white hover:bg-secondary font-bold rounded-full shadow-md hover:shadow-lg transition-all">Join Network</Button></Link>
                <div className="hidden lg:block ml-2"><ThemeToggle /></div>
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-2 lg:pb-0 items-center justify-between w-full lg:w-auto gap-4 scrollbar-hide">
                <div className="flex items-center gap-1.5">
                  <Link href="/" className="shrink-0"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Home className="h-4 w-4" /> Home</Button></Link>
                  <Link href="/directory" className="shrink-0"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Search className="h-4 w-4" /> Directory</Button></Link>
                  <Link href="/profile/me" className="shrink-0"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><User className="h-4 w-4" /> Profile</Button></Link>
                  <Link href="/profile/complete" className="shrink-0"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Settings className="h-4 w-4" /> Edit</Button></Link>
                </div>
                
                <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 dark:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 dark:text-white" /> Admin Panel
                    </Link>
                  )}
                  <ThemeToggle />
                  <form action="/auth/signout" method="get">
                    <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 rounded-full" type="submit">
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-background to-background dark:from-slate-900 dark:via-background dark:to-background">
          {children}
        </main>

        <footer className="border-t border-border bg-white dark:bg-slate-950 mt-auto">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary dark:text-primary" />
                <p className="font-semibold text-slate-800 dark:text-slate-200">© 2026 BRC Loralai Alumni</p>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Connecting Koharians worldwide.</p>
            </div>

            <div className="inline-flex items-center justify-center px-4 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 rounded-md bg-slate-50/50 dark:bg-slate-900/30 shadow-sm text-center">
              Official Alumni Platform
            </div>
            
          </div>
        </footer>
      </body>
    </html>
  );
}