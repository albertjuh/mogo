"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { BrandShield, BRAND_TAGLINE } from "@/components/brand-logo";

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="hidden items-center justify-center bg-accent p-8 text-white lg:flex border-r-4 border-gold">
        <div className="max-w-md text-center flex flex-col items-center">
            <BrandShield size={260} priority className="drop-shadow-2xl" />
            <h1 className="mt-6 text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
              King <span className="text-gold">Bariki</span>
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">{BRAND_TAGLINE}</p>
            <p className="mt-6 text-lg text-white/70 italic">Your Fleet, Your Fortune. Simplified.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
             <div className="lg:hidden mb-4 flex justify-center">
                <BrandShield size={120} priority />
             </div>
             <h1 className="text-3xl font-bold font-headline">Create Your Account</h1>
             <p className="text-muted-foreground">Join the King Bariki Bajaji fleet.</p>
          </div>
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
