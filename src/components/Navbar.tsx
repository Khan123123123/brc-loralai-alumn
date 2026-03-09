"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LayoutDashboard, Megaphone, ChevronDown, MessageSquare, UserCircle2 } from "lucide-react";

export function Navbar({ isAdmin, userEmail }: { isAdmin: boolean; userEmail: string }) {
  const pathname = usePathname();

  // Function to trigger the Contact Form (using a custom event)
  const openContact = () => {
    window.dispatchEvent(new CustomEvent("open-contact-form"));
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/directory" className="text-xl font-black tracking-tighter text-primary">
              BRC LORALAI
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/directory" className={`text-sm font-bold ${pathname === '/directory' ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>Directory</Link>
              
              {/* Added Icon and improved styling to Contact Us button */}
              <button onClick={openContact} className="text-sm font-bold text-slate-600 hover:text-primary flex items-center gap-1.5 transition-colors">
                <MessageSquare className="w-4 h-4" /> Contact Us
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="relative group">
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800">
                  <Settings className="h-3.5 w-3.5 text-emerald-400" /> Admin Controls <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                <div className="absolute right-0 mt-2 w-48 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50">
                  <div className="flex flex-col gap-1 rounded-xl border bg-white p-2 shadow-2xl dark:bg-slate-900">
                    <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200">
                      <LayoutDashboard className="h-4 w-4 text-emerald-600" /> Dashboard
                    </Link>
                    <Link href="/admin/announcements" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200">
                      <Megaphone className="h-4 w-4 text-amber-600" /> Notice Board
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <Link href="/profile/me" className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">
              <UserCircle2 className="h-4 w-4" /> <span className="hidden sm:inline">My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}