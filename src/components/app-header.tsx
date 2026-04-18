"use client";
import { Bell, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment } from "@/lib/types";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';


export function AppHeader() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);
  const [hasMissedPayments, setHasMissedPayments] = useState(false);
  const { user, logout } = useUser();
  const router = useRouter();


  useEffect(() => {
    setClientNow(new Date());
  }, []);

  useEffect(() => {
    if (!clientNow) return;

    const todayStr = format(clientNow, 'yyyy-MM-dd');
    const ridersWhoPaidToday = new Set(
        payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId)
    );
    setHasMissedPayments(riders.some(r => r.active && !ridersWhoPaidToday.has(r.id)));
  }, [riders, payments, clientNow]);


  const handleBellClick = () => {
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            }
        })
    }
  };

  const handleSignOut = async () => {
    logout();
  }

  const currentDateString = clientNow ? format(clientNow, 'dd MMM') : null;

  if (!user) {
    return (
      <header className="md:hidden bg-[#0d1117] text-white flex-shrink-0">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
          <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
            <span>🏍 Boda </span>
            <span className="text-[#f5c842]">Empire</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="md:hidden bg-[#0d1117] text-white flex-shrink-0">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <button onClick={handleSignOut} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <LogOut className="h-5 w-5" />
        </button>
        <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
          <span>🏍 Boda </span>
          <span className="text-[#f5c842]">Empire</span>
        </div>
        <div className="flex items-center gap-3">
          {currentDateString === null ? (
            <Skeleton className="h-4 w-12 bg-white/20" />
          ) : (
            <span className="text-xs font-semibold uppercase text-[#a09080]">
              {currentDateString}
            </span>
          )}
          <button onClick={handleBellClick} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Bell className="h-5 w-5" />
            {clientNow && hasMissedPayments && (
              <span className="absolute right-1.5 top-1.5 block h-2 w-2 rounded-full border-[1.5px] border-[#0d1117] bg-[#e74c3c]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
