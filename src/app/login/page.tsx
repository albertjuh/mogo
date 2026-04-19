"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      {/* Desktop Left Side */}
      <div className="hidden items-center justify-center bg-accent p-8 text-white lg:flex relative overflow-hidden">
        <div className="absolute top-[-10%] -left-20 w-[500px] h-[500px] border-[20px] border-primary/10 rounded-full" />
        <div className="absolute bottom-[-10%] -right-20 w-[300px] h-[300px] border-[15px] border-primary/5 rounded-full" />
        
        <div className="max-w-md text-center relative z-10">
            <Logo white />
            <h1 className="mt-6 text-4xl font-black italic uppercase tracking-tighter text-primary">Boda Empire</h1>
            <p className="mt-4 text-xl text-white/70 italic">Mkopo Wako, Maisha Yako. Rahisi.</p>
        </div>
      </div>

      {/* Login Area */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto w-full max-w-[440px]">
          <Card className="border-none shadow-2xl bg-background">
            <CardHeader className="space-y-4 text-center pt-8">
              <div className="flex justify-center mb-2">
                <Logo />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black font-headline italic uppercase">Karibu Tena</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  Ingia ili kudhibiti akaunti yako ya Mogo.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <AuthForm mode="login" />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Demo Access</span>
                </div>
              </div>

              <Card className="bg-secondary/50 border-dashed border-2 border-primary/20">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="font-headline text-sm font-bold uppercase text-primary">Akaunti za Majaribio</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-[0.75rem] space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-primary/10">
                      <span className="font-bold text-muted-foreground uppercase">Admin:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-bold text-accent">admin@bodaempire.com</code>
                    </div>
                    <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-primary/10">
                      <span className="font-bold text-muted-foreground uppercase">Rider:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-bold text-accent">juma@bodaempire.com</code>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground font-medium">
                    Password: <span className="font-black text-primary">password123</span>
                  </p>
                </CardContent>
              </Card>
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
