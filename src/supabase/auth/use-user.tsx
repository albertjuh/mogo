"use client";

import React, { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AppUser = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "supervisor" | "recruiter" | "rider";
  /** The linked `riders` fleet-record id (only set for role 'rider' with a linked record). */
  riderId?: string;
};

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  reloadUser: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SYSTEM_ADMIN_EMAILS = ["berto.admin@bodaempire.com", "aljohme@gmail.com"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const resolveProfile = useCallback(async (sbUser: SupabaseUser) => {
    const isSystemAdminEmail = SYSTEM_ADMIN_EMAILS.includes(sbUser.email?.toLowerCase() || "");

    let { data: profile } = await supabase
      .from("profiles")
      .select("id, email, name, role")
      .eq("id", sbUser.id)
      .maybeSingle();

    if (!profile) {
      // First sign-in (e.g. fresh Google account): self-register a profile row.
      // Note: this does NOT create a `riders` fleet record -- that's a business
      // record the admin creates (with contract/fee details) via the Fleet page,
      // separately from login access. See src/supabase/mappers.ts profile_id.
      const { data: created } = await supabase
        .from("profiles")
        .upsert({
          id: sbUser.id,
          email: sbUser.email?.toLowerCase() || "",
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || "",
          role: isSystemAdminEmail ? "admin" : "rider",
        })
        .select("id, email, name, role")
        .single();
      profile = created;
    }

    const role = isSystemAdminEmail ? "admin" : (profile?.role as AppUser["role"]) || "rider";
    let riderId: string | undefined;
    if (role === "rider") {
      const { data: riderRow } = await supabase
        .from("riders")
        .select("id")
        .eq("profile_id", sbUser.id)
        .maybeSingle();
      riderId = riderRow?.id;
    }

    setUser({
      id: sbUser.id,
      email: sbUser.email || "",
      name: profile?.name || "",
      role,
      riderId,
    });
  }, [supabase]);

  const reloadUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setSupabaseUser(data.user);
      await resolveProfile(data.user);
    }
  }, [supabase, resolveProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) await resolveProfile(session.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        await resolveProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase, resolveProfile]);

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error("Google Auth error:", e);
      return { success: false, error: e.message || "Could not sign in with Google." };
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login failed:", error);
      return false;
    }
    return true;
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;

      // If email confirmation is off, we already have a session: seed the profile now.
      if (data.session && data.user) {
        await resolveProfile(data.user);
      }
      return true;
    } catch (e) {
      console.error("Signup error:", e);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error("Password reset error:", e);
      return { success: false, error: e.message || "Could not send the reset email." };
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = await res.json();
      if (!res.ok) return { success: false, error: body.error || "Could not delete your account." };
      await supabase.auth.signOut();
      return { success: true };
    } catch (e: any) {
      console.error("Account deletion failed:", e);
      return { success: false, error: "Could not delete your account. Please try again." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, logout, login, signup, loginWithGoogle, resetPassword, reloadUser, deleteAccount, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useUser must be used within an AuthProvider");
  return context;
}
