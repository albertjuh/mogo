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
      <div className="bg-[#0d1117] text-white p-6 rounded-b-3xl flex-shrink-0">
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] text-white p-6 rounded-b-3xl flex-shrink-0" style={{background: 'radial-gradient(ellipse 80% 80% at 80% 100%, #1a3015 0%, transparent 60%), #0d1117'}}>
        <p className="text-sm uppercase text-[#a09080] font-bold tracking-widest">Active Loan</p>
        <p className="font-black text-4xl text-[#FFD700] my-1">
          {activeLoan ? activeLoan.loanType : "No Loan"}
        </p>
        <p className="text-sm text-[#a09080] font-semibold">
          {activeLoan ? `Status: ${activeLoan.loanStatus}` : "Apply for a loan today"}
        </p>
    </div>
  );
}
