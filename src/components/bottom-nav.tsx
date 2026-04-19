"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, UserPlus } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = useMemo(() => {
    if (!user) return [];

    if (user.role === 'rider') {
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/payments", label: "History", icon: BarChart3 }, // Swapped Lipa for History for better account management
        { href: "/vault", label: "Docs", icon: ShieldCheck },
        { href: "/savings", label: "Savings", icon: TrendingUp },
      ];
    }

    if (user.role === 'recruiter') {
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/fleet", label: "Onboard", icon: UserPlus },
      ];
    }

    // Admin or Supervisor
    return [
      { href: "/", label: "Stats", icon: Home },
      { href: "/collect", label: "Collect", icon: Wallet },
      { href: "/fleet", label: "Fleet", icon: Users },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ];
  }, [user]);

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 z-10 w-full border-t border-t-muted bg-white pb-safe">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon size={20} className={cn(isActive && "fill-current/10")} />
              <span className="text-[0.60rem] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
