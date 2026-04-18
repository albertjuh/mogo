"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BodaEmpireIcon } from "@/components/icons";

export default function LoginPage() {
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
            <h1 className="text-3xl font-bold font-headline">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Log in to manage your empire.
            </p>
          </div>
          <AuthForm mode="login" />
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Demo Accounts</CardTitle>
              <CardDescription>Use these credentials to log in.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="font-semibold">Admin:</p>
                <p>Email: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">admin@bodaempire.com</code></p>
                <p>Password: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">password123</code></p>
              </div>
               <div>
                <p className="font-semibold">Supervisor:</p>
                <p>Email: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">supervisor@bodaempire.com</code></p>
                <p>Password: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">password123</code></p>
              </div>
               <div>
                <p className="font-semibold">Rider:</p>
                <p>Email: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">juma@bodaempire.com</code></p>
                <p>Password: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">password123</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
