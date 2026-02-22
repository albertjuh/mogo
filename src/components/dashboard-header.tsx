"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";

export function DashboardHeader() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const dashboardStats = useMemo(() => {
    if (!clientNow) {
        return {
            activeBodas: null, paidTodayCount: null, missingCount: null,
            tzsToday: null
        };
    }
    const today = clientNow;
    const todayStr = format(today, 'yyyy-MM-dd');
    const activeRiders = riders.filter(r => r.active);
    
    const paidToday = new Set(payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId));
    
    const tzsToday = payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).reduce((sum, p) => sum + p.amount, 0);

    return {
      activeBodas: activeRiders.length,
      paidTodayCount: paidToday.size,
      missingCount: activeRiders.length - paidToday.size,
      tzsToday,
    };
  }, [riders, payments, clientNow]);
  
  const { activeBodas, paidTodayCount, missingCount, tzsToday } = dashboardStats;
  const isLoading = activeBodas === null;

  return (
    <div className="bg-[#0d1117] text-white p-6 rounded-b-3xl flex-shrink-0" style={{background: 'radial-gradient(ellipse 80% 80% at 80% 100%, #1a3015 0%, transparent 60%), #0d1117'}}>
        <p className="text-sm uppercase text-[#a09080] font-bold tracking-widest">Fleet Status</p>
        {isLoading ? <Skeleton className="h-16 w-24 my-1 bg-white/20" /> : <p className="font-black text-6xl text-[#f5c842] my-1">{activeBodas}</p> }
        <p className="text-sm text-[#a09080] font-semibold -mt-2">active bodas</p>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-white/10 rounded-lg p-2">
                {isLoading ? <Skeleton className="h-7 w-8 mx-auto bg-white/20"/> : <p className="text-xl font-bold">{paidTodayCount}</p> }
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Paid Today</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
                {isLoading ? <Skeleton className="h-7 w-8 mx-auto bg-white/20"/> : <p className="text-xl font-bold">{missingCount}</p> }
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Missing</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
                {isLoading ? <Skeleton className="h-7 w-12 mx-auto bg-white/20"/> : <p className="text-xl font-bold">{formatCurrency(tzsToday)}</p> }
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">TZS Today</p>
            </div>
        </div>
    </div>
  );
}
