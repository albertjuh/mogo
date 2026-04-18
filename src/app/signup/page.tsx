"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { BodaEmpireIcon } from "@/components/icons";

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="hidden items-center justify-center bg-primary p-8 text-primary-foreground lg:flex">
        <div className="max-w-md text-center">
            <BodaEmpireIcon className="mx-auto h-24 w-24" />
            <h1 className="mt-4 text-5xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Boda Empire</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">Your Fleet, Your Fortune. Simplified.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
             <h1 className="text-3xl font-bold font-headline">Create Your Account</h1>
             <p className="text-muted-foreground">Join the Boda Empire fleet.</p>
          </div>
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
