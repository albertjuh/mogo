"use client";
import { Bell, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/firebase/auth/use-user';

export function AppHeader() {
  const [clientNow, setClientNow] = useState<Date | null>(null);
  const { user, logout } = useUser();

  useEffect(() => {
    setClientNow(new Date());
  }, []);

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
            <span>🏍 Mogo </span>
            <span className="text-[#FFD700]">Connect</span>
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
          <span>🏍 Mogo </span>
          <span className="text-[#FFD700]">Connect</span>
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
          </button>
        </div>
      </div>
    </header>
  );
}
