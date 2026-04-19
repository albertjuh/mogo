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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "./use-user";

interface AuthFormProps {
  mode: "login" | "signup";
}

const formSchema = z.object({
  name: z.string().min(2, "Full name is required.").optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['supervisor', 'rider', 'recruiter']).optional(),
});

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: 'rider',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (mode === "login") {
      const success = await login(values.email, values.password);
      if (success) {
        toast({ title: "Logged In Successfully!" });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password.",
        });
        setIsLoading(false);
      }
    } else {
      const success = await signup(values.email, values.password, values.name || "", values.role || 'rider');
      if (success) {
        toast({ title: "Account Created Successfully!" });
      } else {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: "Could not create account. Email might already be in use.",
        });
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
          {mode === "signup" && (
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className={mode === 'signup' ? 'text-white/80' : ''}>Full Name (Jina Kamili)</FormLabel>
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
                  <Input placeholder="name@email.com" {...field} className={mode === 'signup' ? "bg-white/5 border-white/10 text-white" : ""} />
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
                  <Input type="password" placeholder="••••••••" {...field} className={mode === 'signup' ? "bg-white/5 border-white/10 text-white" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "signup" && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">I am a...</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor (Ground Ops)</SelectItem>
                      <SelectItem value="recruiter">Recruiter (Onboarding)</SelectItem>
                      <SelectItem value="rider">Rider (Client)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-primary text-primary-foreground font-bold h-12 uppercase tracking-widest hover:bg-primary/90 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm pt-2">
        {mode === "login" ? (
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[0.6rem]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline ml-1">
              Sign Up
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
