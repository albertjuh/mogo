"use client";

import { AuthForm } from "@/firebase/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="w-full max-w-sm mt-8 bg-secondary">
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
  );
}
