"use client";
import { Bell, LogOut, UserCircle } from 'lucide-react';
import { useUser } from '@/supabase/auth/use-user';
import { BrandLogo } from '@/components/brand-logo';
import { LanguageToggle } from '@/components/language-toggle';
import Link from 'next/link';

export function AppHeader() {
  const { user, logout } = useUser();

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

  const Logo = () => <BrandLogo size={38} tone="light" showTagline={false} priority />;

  if (!user) {
    return (
      <header className="md:hidden bg-accent text-white flex-shrink-0 border-b-2 border-gold">
        <div className="mx-auto flex h-14 w-full items-center justify-center px-4">
          <Logo />
        </div>
      </header>
    );
  }

  return (
    <header className="md:hidden bg-accent text-white flex-shrink-0 border-b-2 border-gold">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <button onClick={handleSignOut} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <LogOut className="h-5 w-5" />
        </button>
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle className="bg-white/10 [&_button.bg-primary]:bg-primary" />
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
