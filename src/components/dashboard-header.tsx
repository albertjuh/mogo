
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans } from "@/lib/data";
import type { Loan } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";

export function DashboardHeader() {
  const { user } = useUser();
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const activeLoan = useMemo(() => loans.find(l => l.clientId === user?.id && l.loanStatus === "Active"), [loans, user]);
  const isLoading = !clientNow;

  if (isLoading) {
    return (
      <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0">
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  // --- ADMIN/SUPERVISOR/RECRUITER VIEW ---
  if (user?.role !== 'rider') {
    return (
        <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-white/5 rounded-full" />
            
            <p className="text-xs uppercase text-white/60 font-bold tracking-widest relative z-10">Mogo Connect</p>
            <p className="font-black text-4xl text-white italic my-1 relative z-10 uppercase">
                System Status
            </p>
            <p className="text-sm text-white/80 font-semibold relative z-10 uppercase tracking-tighter">
                Operational & Secure
            </p>
        </div>
    );
  }

  // --- RIDER VIEW ---
  return (
    <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-primary/20 rounded-full" />
        
        <p className="text-xs uppercase text-white/60 font-bold tracking-widest relative z-10">Mkopo Wako</p>
        <p className="font-black text-4xl text-primary italic my-1 relative z-10">
          {activeLoan ? activeLoan.loanType : "Huna Mkopo"}
        </p>
        <p className="text-sm text-white/80 font-semibold relative z-10">
          {activeLoan ? `Hali: ${activeLoan.loanStatus}` : "Omba mkopo leo"}
        </p>
    </div>
  );
}
