"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const Logo = () => (
    <Image 
      src="/mogo-logo.png" 
      alt="Mogo Logo" 
      width={220} 
      height={60} 
      priority 
      className="object-contain"
    />
  );

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-accent p-8 text-white lg:flex">
        <div className="max-w-md text-center relative">
            {/* Logo decorative element */}
            <div className="absolute -top-20 -left-20 w-60 h-60 border-[12px] border-primary/20 rounded-full" />
            
            <Logo />
            <p className="mt-4 text-lg text-white/70 italic">Mkopo Wako, Maisha Yako. Rahisi.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-8 bg-background">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
            <div className="lg:hidden mb-4 flex justify-center">
                <Logo />
            </div>
            <h1 className="text-3xl font-bold font-headline">Karibu Tena</h1>
            <p className="text-balance text-muted-foreground">
              Ingia ili kudhibiti akaunti yako ya Mogo.
            </p>
          </div>
          <AuthForm mode="login" />
          <Card className="bg-secondary border-none">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Akaunti za Majaribio</CardTitle>
              <CardDescription>Tumia hizi ili kuingia.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="font-semibold text-xs uppercase text-muted-foreground">Admin/Mgmt:</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded text-foreground">admin@bodaempire.com</code></p>
                
                <p className="font-semibold text-xs uppercase text-muted-foreground mt-2">Recruiter:</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded text-foreground">recruiter@bodaempire.com</code></p>
                
                <p className="font-semibold text-xs uppercase text-muted-foreground mt-2">Mteja (Rider):</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded text-foreground">juma@bodaempire.com</code></p>
                
                <p className="mt-2 text-[0.65rem]">Password kwa wote: <code className="font-bold">password123</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
