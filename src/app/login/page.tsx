"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const Logo = ({ white = false }: { white?: boolean }) => (
    <Image 
      src="/mogo-logo.png" 
      alt="Mogo Logo" 
      width={180} 
      height={50} 
      priority 
      className={`object-contain ${white ? 'brightness-0 invert' : ''}`}
    />
  );

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-muted/30">
      {/* Desktop Left Side - High Contrast Brand Area */}
      <div className="hidden items-center justify-center bg-accent p-8 text-white lg:flex relative overflow-hidden">
        {/* Subtle geometric background elements */}
        <div className="absolute top-[-10%] -left-20 w-[500px] h-[500px] border-[20px] border-primary/10 rounded-full" />
        <div className="absolute bottom-[-10%] -right-20 w-[300px] h-[300px] border-[15px] border-primary/5 rounded-full" />
        
        <div className="max-w-md text-center relative z-10">
            <Logo white />
            <h1 className="mt-6 text-4xl font-black italic uppercase tracking-tighter text-primary">Boda Empire</h1>
            <p className="mt-4 text-xl text-white/70 italic">Mkopo Wako, Maisha Yako. Rahisi.</p>
        </div>
      </div>

      {/* Login Area - Clean, Focused Right Side */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-[440px]">
          <Card className="border-none shadow-2xl bg-background">
            <CardHeader className="space-y-4 text-center pt-8">
              <div className="flex justify-center mb-2">
                <Logo />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black font-headline italic uppercase">Karibu Tena</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <AuthForm mode="login" />
            </CardContent>
          </Card>
          
          <p className="text-center mt-6 text-xs text-muted-foreground font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Boda Empire • Powered by Mogo
          </p>
        </div>
      </div>
    </div>
  );
}
