
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "./use-user";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface AuthFormProps {
  mode: "login" | "signup";
}

const formSchema = z.object({
  name: z.string().min(2, "Full name is required.").optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup, loginWithGoogle } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast({ title: "Logged in successfully!" });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Google Login Failed",
          description: result.error
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        if (mode === "login") {
          const success = await login(values.email, values.password);
          if (success) {
            toast({ title: "Logging you in..." });
          } else {
            toast({
              variant: "destructive",
              title: "Authentication Failed",
              description: "Invalid email or password.",
            });
            setIsLoading(false);
          }
        } else {
          const success = await signup(values.email, values.password, values.name || "", 'rider');
          if (success) {
            toast({ 
                title: "Activation Link Sent!",
                description: "Check your email to activate your account."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup Failed",
              description: "Could not create account. Email might already be in use.",
            });
            setIsLoading(false);
          }
        }
    } catch (error) {
        console.error("Auth error:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred."
        });
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={handleGoogleLogin} 
        disabled={isGoogleLoading || isLoading}
        className={cn(
          "w-full h-12 border-white/10 text-white hover:bg-white/5 transition-all",
          mode === 'login' ? 'bg-accent' : 'bg-primary'
        )}
      >
        {isGoogleLoading ? <Loader2 className="animate-spin mr-2" /> : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full opacity-10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className={cn("px-2 font-bold", mode === 'signup' ? 'bg-accent text-white/40' : 'bg-background text-muted-foreground')}>
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 text-left transition-opacity duration-300", (isLoading || isGoogleLoading) && "opacity-70 pointer-events-none")}>
          {mode === "signup" && (
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-white/80">Full Name (Jina Kamili)</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Juma Hassan" {...field} className="pl-9 bg-white/5 border-white/10 text-white" />
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mode === 'signup' ? 'text-white/80' : ''}>Email Address</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Mail className={cn("absolute left-3 top-3 h-4 w-4 text-muted-foreground", mode === 'signup' && "text-white/40")} />
                        <Input placeholder="name@email.com" {...field} className={cn("pl-9", mode === 'signup' ? "bg-white/5 border-white/10 text-white" : "")} />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={mode === 'signup' ? 'text-white/80' : ''}>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className={cn("absolute left-3 top-3 h-4 w-4 text-muted-foreground", mode === 'signup' && "text-white/40")} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      className={cn("pl-9 pr-10", mode === 'signup' ? "bg-white/5 border-white/10 text-white" : "")} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isLoading || isGoogleLoading} 
            className="w-full bg-primary text-primary-foreground font-bold h-12 uppercase tracking-widest hover:bg-primary/90 mt-2 relative overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>{mode === "login" ? "Log In" : "Create Account"}</span>
            )}
          </Button>

          {mode === "signup" && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex gap-2 items-start mt-4">
                  <ShieldCheck className="text-primary shrink-0 h-4 w-4 mt-0.5" />
                  <p className="text-[0.6rem] text-white/50 font-medium">
                      An activation link will be sent to your email. You must click it to enter the platform.
                  </p>
              </div>
          )}
        </form>
      </Form>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[0.6rem]">
            New to the Empire?{" "}
            <Link href="/signup" className="text-primary hover:underline ml-1">
              Join as Rider
            </Link>
          </p>
        ) : (
          <p className="text-white/60 font-bold uppercase tracking-widest text-[0.6rem]">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline ml-1">
              Log In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
