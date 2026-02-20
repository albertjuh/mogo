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
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useFirebase } from "../provider";

interface AuthFormProps {
  mode: "login" | "signup";
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function AuthForm({ mode }: AuthFormProps) {
  const { app } = useFirebase();
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Account Created!", description: "You are now logged in." });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Logged In Successfully!" });
      }
      router.push("/");
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                    <Input placeholder="rider@bodaempire.com" {...field} />
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
            <Button type="submit" disabled={isLoading} className="w-full bg-[#0d1117] text-[#f5c842] hover:bg-[#0d1117]/90">
            {isLoading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? "Log In" : "Create Account")}
            </Button>
        </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <Link href={mode === 'login' ? '/signup' : '/login'} className="ml-1 font-semibold text-primary hover:underline">
                {mode === 'login' ? "Sign Up" : "Log In"}
            </Link>
        </p>
    </div>
  );
}
