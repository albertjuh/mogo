
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans, initialRiders, initialPayments } from "@/lib/data";
import type { Loan, Rider, Payment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { format, isSameDay, parseISO } from "date-fns";

export function DashboardHeader() {
  const { user } = useUser();
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const activeLoan = useMemo(() => loans.find(l => l.clientId === user?.id && l.loanStatus === "Active"), [loans, user]);
  
  const mngtStats = useMemo(() => {
    if (!clientNow || user?.role === 'rider') return null;
    
    const activeFleet = riders.filter(r => r.active).length;
    const paidToday = new Set(
      payments
        .filter(p => isSameDay(parseISO(p.date), clientNow))
        .map(p => p.riderId)
    ).size;
    
    return { activeFleet, paidToday };
  }, [riders, payments, clientNow, user]);

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
                {mngtStats?.activeFleet} <span className="text-primary">Riders</span>
            </p>
            <p className="text-sm text-white/80 font-semibold relative z-10 uppercase tracking-tighter">
                {mngtStats?.paidToday} Payments Received Today
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
