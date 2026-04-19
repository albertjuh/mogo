
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "./use-user";

interface AuthFormProps {
  mode: "login" | "signup";
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['admin', 'supervisor', 'rider', 'recruiter']).optional(),
});

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: 'admin',
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
      const success = await signup(values.email, values.password, values.role || 'admin');
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@bodaempire.com" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>Initial Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator (Strategic)</SelectItem>
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
            className="w-full bg-accent text-white font-bold h-12 uppercase tracking-widest hover:bg-accent/90"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        {mode === "login" ? (
          <p className="text-white/60 font-bold uppercase tracking-widest text-[0.6rem]">
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
