import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Users, Globe, GraduationCap } from "lucide-react";

export default async function HomePage() {
  const supabase = createClient();
  const { data: profiles } = await supabase.from('profiles').select('verification_status, current_country');
  const totalAlumni = profiles?.length || 0;
  const countries = new Set(profiles?.map(p => p.current_country).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-bold text-xl text-blue-600">BRC Loralai Alumni</h1>
          <div className="flex gap-4">
            <Link href="/auth/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/auth/signup"><Button className="bg-blue-600">Join Network</Button></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">BRC Loralai Alumni Network</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Connecting Koharians worldwide. Join your fellow alumni from Balochistan Residential College, Loralai.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup"><Button size="lg" className="bg-blue-600">Join the Network</Button></Link>
            <Link href="/auth/login"><Button size="lg" variant="outline">Member Login</Button></Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold">{totalAlumni}+</h3>
                <p className="text-gray-600">Registered Alumni</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold">{countries || 1}+</h3>
                <p className="text-gray-600">Countries</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold">40+</h3>
                <p className="text-gray-600">Years of Excellence</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 text-center bg-white">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">1</div>
              <h3 className="font-bold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account with email verification</p>
            </div>
            <div>
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">2</div>
              <h3 className="font-bold mb-2">Verify</h3>
              <p className="text-gray-600">Complete your profile and answer BRC-specific questions</p>
            </div>
            <div>
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">3</div>
              <h3 className="font-bold mb-2">Connect</h3>
              <p className="text-gray-600">Access the directory and connect with fellow Koharians</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 BRC Loralai Alumni Network. All rights reserved.</p>
          <p className="text-gray-400 text-sm">Connecting Koharians worldwide</p>
        </div>
      </footer>
    </div>
  );
}
