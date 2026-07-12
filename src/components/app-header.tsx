"use client";
import { Bell, LogOut, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/firebase/auth/use-user';
import Image from 'next/image';
import Link from 'next/link';

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

  const Logo = () => (
    <Image 
      src="/mogo-logo.png" 
      alt="Mogo Logo" 
      width={90} 
      height={24} 
      priority 
      className="object-contain brightness-0 invert" // Keeps it white for the navy header
    />
  );

  if (!user) {
    return (
      <header className="md:hidden bg-accent text-white flex-shrink-0">
        <div className="mx-auto flex h-14 w-full items-center justify-center px-4">
          <Logo />
        </div>
      </header>
    );
  }

  return (
    <header className="md:hidden bg-accent text-white flex-shrink-0">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <button onClick={handleSignOut} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <LogOut className="h-5 w-5" />
        </button>
        <Logo />
        <div className="flex items-center gap-3">
          {currentDateString === null ? (
            <Skeleton className="h-4 w-12 bg-white/20" />
          ) : (
            <span className="text-[0.6rem] font-bold uppercase text-white/60 tracking-tighter">
              {currentDateString}
            </span>
          )}
          <button onClick={handleBellClick} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Bell className="h-5 w-5" />
          </button>
          <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <UserCircle className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
