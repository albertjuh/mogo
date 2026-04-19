"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans } from "@/lib/data";
import type { Loan } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";

export function DashboardHeader() {
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const activeLoan = useMemo(() => loans.find(l => l.loanStatus === "Active"), [loans]);
  const isLoading = !clientNow;

  if (isLoading) {
    return (
      <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0">
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  return (
    <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0 relative overflow-hidden">
        {/* Subtle decorative arch mimicking the logo */}
        <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-primary/20 rounded-full" />
        
        <p className="text-xs uppercase text-white/60 font-bold tracking-widest">Mkopo Wako</p>
        <p className="font-black text-4xl text-primary italic my-1">
          {activeLoan ? activeLoan.loanType : "Huna Mkopo"}
        </p>
        <p className="text-sm text-white/80 font-semibold">
          {activeLoan ? `Hali: ${activeLoan.loanStatus}` : "Omba mkopo leo"}
        </p>
    </div>
  );
}
