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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "./use-user";

interface AuthFormProps {
  mode: "login" | "signup";
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export function AuthForm({ mode }: AuthFormProps) {
  const { login } = useUser();
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
    const success = login(values.email, values.password);
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
  }

  if (mode === 'signup') {
      return (
          <div className="text-center text-muted-foreground space-y-4">
              <p>User registration is handled by administrators.</p>
              <Button asChild variant="outline">
                <Link href='/login'>
                    Go to Log In
                </Link>
              </Button>
          </div>
      )
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
                    <Input placeholder="admin@bodaempire.com" {...field} />
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
            {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
            </Button>
        </form>
        </Form>
    </div>
  );
}
