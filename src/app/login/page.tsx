"use client";

import { AuthForm } from "@/firebase/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center h-full -mt-16">
        <div className="w-full max-w-sm">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
                <p className="text-muted-foreground">Log in to manage your empire.</p>
            </header>
            <AuthForm mode="login" />
        </div>
    </div>
  );
}
