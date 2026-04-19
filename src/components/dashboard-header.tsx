
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans, initialRiders, initialPayments } from "@/lib/data";
import type { Loan, Rider, Payment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { startOfDay, differenceInDays, differenceInWeeks, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function DashboardHeader() {
  const { user } = useUser();
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const riderDebtCount = useMemo(() => {
    if (!clientNow || !user || user.role === 'rider') return 0;
    
    return riders.filter(r => r.active).filter(rider => {
      const riderPayments = payments.filter(p => p.riderId === rider.id);
      const start = startOfDay(parseISO(rider.contractStart));
      let totalOwed = 0;
      
      if (rider.paymentFrequency === 'Weekly') {
        const weeksElapsed = differenceInWeeks(clientNow, start);
        totalOwed = weeksElapsed > 0 ? weeksElapsed * rider.dailyFee : 0;
      } else {
        const daysElapsed = differenceInDays(clientNow, start);
        totalOwed = (daysElapsed >= 0) ? (daysElapsed + 1) * rider.dailyFee : 0;
      }

      const totalPaid = riderPayments.reduce((sum, p) => sum + p.amount, 0);
      return (totalPaid - totalOwed) < 0;
    }).length;
  }, [riders, payments, clientNow, user]);

  const activeLoan = useMemo(() => loans.find(l => l.clientId === user?.id && l.loanStatus === "Active"), [loans, user]);
  const isLoading = !clientNow;

  if (isLoading) {
    return (
      <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0">
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  // --- ADMIN/SUPERVISOR VIEW ---
  if (user?.role === 'admin' || user?.role === 'supervisor') {
    return (
        <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0 relative overflow-hidden transition-all duration-500">
            <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-white/5 rounded-full" />
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs uppercase text-white/60 font-bold tracking-widest">Fleet Status</p>
                    <p className="font-black text-4xl text-white italic my-1 flex items-center gap-2">
                        {riderDebtCount > 0 ? (
                            <>
                                {riderDebtCount} <span className="text-white/60">PENDING</span>
                            </>
                        ) : (
                            "SYSTEM OK"
                        )}
                    </p>
                    <p className="text-sm text-white/80 font-semibold uppercase tracking-tighter">
                        {riderDebtCount > 0 
                            ? `${riderDebtCount} riders require payment reconciliation.` 
                            : "All collections are currently on track."}
                    </p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl shadow-lg">
                    {riderDebtCount > 0 ? (
                        <AlertCircle className="h-8 w-8 text-white opacity-80" />
                    ) : (
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    )}
                </div>
            </div>
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
