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
import { Loader2, User, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "./use-user";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, signup, resetPassword } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = useMemo(() => z.object({
    // The name field is only rendered in signup mode, so login submits it as
    // "" (the defaultValue) -- .optional() alone only skips undefined, not "",
    // so an empty string must be allowed explicitly or every login is silently
    // rejected by validation.
    name: z.union([z.literal(""), z.string().min(2, t("auth.validation.nameRequired"))]).optional(),
    email: z.string().email(t("auth.validation.emailInvalid")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function handleForgotPassword() {
    const email = form.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({ variant: "destructive", title: t("auth.toast.enterEmailFirstTitle"), description: t("auth.toast.enterEmailFirstDesc") });
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        toast({ title: t("auth.toast.resetSentTitle"), description: t("auth.toast.resetSentDesc", { email }) });
      } else {
        toast({ variant: "destructive", title: t("auth.toast.resetFailedTitle"), description: result.error });
      }
    } finally {
      setIsResetting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        if (mode === "login") {
          const success = await login(values.email, values.password);
          if (!success) {
            toast({
              variant: "destructive",
              title: t("auth.toast.authFailedTitle"),
              description: t("auth.toast.authFailedDesc"),
            });
          }
        } else {
          if (!values.name || values.name.trim().length < 2) {
            toast({
              variant: "destructive",
              title: t("auth.toast.fullNameRequiredTitle"),
              description: t("auth.toast.fullNameRequiredDesc"),
            });
            return;
          }
          const success = await signup(values.email, values.password, values.name);
          if (success) {
            toast({
                title: t("auth.toast.accountCreatedTitle"),
                description: t("auth.toast.accountCreatedDesc")
            });
          } else {
            toast({
              variant: "destructive",
              title: t("auth.toast.signupFailedTitle"),
              description: t("auth.toast.signupFailedDesc"),
            });
          }
        }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4 text-left transition-opacity duration-300", isLoading && "opacity-70 pointer-events-none")}>
          {mode === "signup" && (
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-white/80">{t("auth.form.fullName")}</FormLabel>
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
                <FormLabel className={mode === 'signup' ? 'text-white/80' : ''}>{t("auth.form.email")}</FormLabel>
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
                <FormLabel className={mode === 'signup' ? 'text-white/80' : ''}>{t("auth.form.password")}</FormLabel>
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
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
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
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold h-12 uppercase tracking-widest hover:bg-primary/90 mt-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : mode === "login" ? t("auth.form.login") : t("auth.form.createAccount")}
          </Button>

          {mode === "login" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="w-full text-center text-xs font-bold text-muted-foreground hover:text-primary underline underline-offset-2"
            >
              {isResetting ? t("auth.form.sending") : t("auth.form.forgotPassword")}
            </button>
          )}

          {mode === "signup" && (
            <>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex gap-2 items-start mt-4">
                  <ShieldCheck className="text-primary shrink-0 h-4 w-4 mt-0.5" />
                  <p className="text-[0.6rem] text-white/50 font-medium">
                      {t("auth.form.emailConfirmNotice")}
                  </p>
              </div>
              <p className="text-[0.6rem] text-white/40 text-center">
                {t("auth.form.termsAgree")}{" "}
                <Link href="/terms" className="underline">{t("auth.form.termsOfService")}</Link> {t("auth.form.and")}{" "}
                <Link href="/privacy" className="underline">{t("auth.form.privacyPolicy")}</Link>.
              </p>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
