"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="hidden items-center justify-center bg-primary p-8 text-primary-foreground lg:flex">
        <div className="max-w-md text-center">
            <Image 
              src="/mogo-logo.png" 
              alt="Mogo Logo" 
              width={200} 
              height={60} 
              priority 
              className="mx-auto h-auto w-auto brightness-0 invert mb-8"
            />
            <h1 className="mt-4 text-5xl font-black italic uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Boda Empire
            </h1>
            <p className="mt-2 text-lg text-primary-foreground/80 italic">Your Fleet, Your Fortune. Simplified.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
             <div className="lg:hidden mb-4 flex justify-center">
                <Image 
                  src="/mogo-logo.png" 
                  alt="Mogo Logo" 
                  width={150} 
                  height={40} 
                  priority 
                  className="object-contain"
                />
             </div>
             <h1 className="text-3xl font-bold font-headline">Create Your Account</h1>
             <p className="text-muted-foreground">Join the Boda Empire fleet.</p>
          </div>
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
