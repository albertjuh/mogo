
"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandShield, BRAND_NAME, BRAND_TAGLINE } from "@/components/brand-logo";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-muted/30">
      {/* Desktop Left Side - High Contrast Brand Area */}
      <div className="hidden items-center justify-center bg-accent p-8 text-white lg:flex relative overflow-hidden">
        {/* Subtle geometric background elements */}
        <div className="absolute top-[-10%] -left-20 w-[500px] h-[500px] border-[20px] border-gold/15 rounded-full" />
        <div className="absolute bottom-[-10%] -right-20 w-[300px] h-[300px] border-[15px] border-primary/10 rounded-full" />

        <div className="max-w-md text-center relative z-10 flex flex-col items-center">
            <BrandShield size={260} priority className="drop-shadow-2xl" />
            <h1 className="mt-6 text-5xl font-black uppercase tracking-tighter">
              King <span className="text-gold">Bariki</span>
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">{BRAND_TAGLINE}</p>
            <p className="mt-6 text-xl text-white/70 italic">Bajaji Yako, Maisha Yako. Rahisi.</p>
        </div>
      </div>

      {/* Login Area - Clean, Focused Right Side */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-[440px]">
          <Card className="border-none shadow-2xl bg-background overflow-hidden">
            {/* Colored Header - Added color to the 'front' of the form as requested */}
            <CardHeader className="bg-accent text-white space-y-4 text-center py-10 relative overflow-hidden border-b-4 border-gold">
              {/* Decorative background crest */}
              <div className="absolute top-[-15%] right-[-12%] opacity-10 rotate-12 pointer-events-none">
                  <BrandShield size={220} />
              </div>

              {/* Only show this logo if we can't see the other logo on the left (on small screens) */}
              <div className="flex justify-center lg:hidden relative z-10">
                <BrandShield size={130} priority />
              </div>

              <div className="space-y-1 relative z-10">
                <CardTitle className="text-3xl font-black font-headline italic uppercase tracking-tighter">
                  Karibu <span className="text-gold">Tena</span>
                </CardTitle>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Strategic Command Center</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-8 py-8">
              <AuthForm mode="login" />
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-xs text-muted-foreground font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} {BRAND_NAME} • {BRAND_TAGLINE}
          </p>
        </div>
      </div>
    </div>
  );
}
