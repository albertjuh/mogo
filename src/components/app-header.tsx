"use client";
import { Bell } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment } from "@/lib/types";
import { useMemo } from "react";

export function AppHeader() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);

  const hasMissedPayments = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const ridersWhoPaidToday = new Set(
        payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId)
    );
    return riders.some(r => !ridersWhoPaidToday.has(r.id));
  }, [riders, payments]);

  const handleBellClick = () => {
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            }
        })
    }
  }

  return (
    <header className="bg-[#0d1117] text-white flex-shrink-0">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
          <span>🏍 Boda </span>
          <span className="text-[#f5c842]">Empire</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase text-[#a09080]">
            {format(new Date(), 'dd MMM')}
          </span>
          <button onClick={handleBellClick} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Bell className="h-5 w-5" />
            {hasMissedPayments && (
              <span className="absolute right-1.5 top-1.5 block h-2 w-2 rounded-full border-[1.5px] border-[#0d1117] bg-[#e74c3c]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
