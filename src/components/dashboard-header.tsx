
"use client";

import { useTable, type TableQuery } from "@/supabase/use-table";
import { useRow } from "@/supabase/use-row";
import { riderFromRow, paymentFromRow, type RiderRow, type PaymentRow } from "@/supabase/mappers";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "@/supabase/auth/use-user";
import { isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { user } = useUser();

  const [clientNow, setClientNow] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setClientNow(new Date());

    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const handleScroll = () => {
      const currentScrollY = mainEl.scrollTop;
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY.current) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time Supabase data for the header
  const { data: riderProfile } = useRow<RiderRow, ReturnType<typeof riderFromRow>>(
    user?.role === 'rider' ? "riders" : null,
    user?.id,
    riderFromRow,
    "*",
    "profile_id"
  );

  const ridersQuery: TableQuery | null = user && user.role !== 'rider' ? { table: "riders" } : null;
  const { data: riders } = useTable<RiderRow, ReturnType<typeof riderFromRow>>(ridersQuery, riderFromRow);

  const paymentsQuery: TableQuery | null = user && user.role !== 'rider' && clientNow ? { table: "payments" } : null;
  const { data: payments } = useTable<PaymentRow, ReturnType<typeof paymentFromRow>>(paymentsQuery, paymentFromRow);

  const mngtStats = useMemo(() => {
    if (!clientNow || !riders || !payments) return null;
    const activeFleet = riders.filter(r => r.active).length;
    const paidTodayCount = new Set(
      payments
        .filter(p => isSameDay(parseISO(p.recordedAt), clientNow))
        .map(p => p.riderId)
    ).size;
    return { activeFleet, paidTodayCount };
  }, [riders, payments, clientNow]);

  const isLoading = !clientNow;

  if (isLoading) {
    return (
      <div className="bg-accent text-white p-6 rounded-b-3xl flex-shrink-0">
        <Skeleton className="h-20 w-full bg-white/10" />
      </div>
    );
  }

  const containerClasses = cn(
    "bg-accent text-white flex-shrink-0 transition-all duration-500 ease-in-out relative overflow-hidden",
    isVisible 
      ? "max-h-[250px] opacity-100 translate-y-0" 
      : "max-h-0 opacity-0 -translate-y-12 md:max-h-[250px] md:opacity-100 md:translate-y-0"
  );

  return (
    <div className={containerClasses}>
        <div className="p-6 rounded-b-3xl">
            {user?.role !== 'rider' ? (
                <div className="relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-white/5 rounded-full" />
                    <p className="text-xs uppercase text-white/60 font-bold tracking-widest relative z-10">
                        {user?.role === 'admin' ? 'Strategic Command' : 'Ground Operations'}
                    </p>
                    <p className="font-black text-4xl text-white italic my-1 relative z-10 uppercase">
                        {mngtStats?.activeFleet || 0} <span className="text-primary">Riders</span>
                    </p>
                    <p className="text-sm text-white/80 font-semibold relative z-10 uppercase tracking-tighter">
                        {mngtStats?.paidTodayCount || 0} {mngtStats?.paidTodayCount === 1 ? 'Collection' : 'Collections'} Today
                    </p>
                </div>
            ) : (
                <div className="relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 border-8 border-primary/20 rounded-full" />
                    <p className="text-xs uppercase text-white/60 font-bold tracking-widest relative z-10">Mkopo Wako</p>
                    <p className="font-black text-4xl text-primary italic my-1 relative z-10">
                      {riderProfile?.vehicleType || "Huna Mkopo"}
                    </p>
                    <p className="text-sm text-white/80 font-semibold relative z-10">
                      {riderProfile?.plateNumber ? `Plate: ${riderProfile.plateNumber}` : "Omba mkopo leo"}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}
