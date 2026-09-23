
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, UserPlus } from "lucide-react";
import { useUser } from "@/supabase/auth/use-user";
import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguage();

  const navItems = useMemo(() => {
    if (!user) return [];

    if (user.role === 'rider') {
      return [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/payments", label: t("nav.paymentHistory"), icon: BarChart3 },
        { href: "/vault", label: t("nav.vault"), icon: ShieldCheck },
        { href: "/savings", label: t("nav.savings"), icon: TrendingUp },
      ];
    }

    if (user.role === 'recruiter') {
      return [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/onboard", label: t("nav.onboard"), icon: UserPlus },
        { href: "/fleet", label: t("nav.fleetList"), icon: Users },
      ];
    }

    // Admin or Supervisor
    return [
      { href: "/", label: t("nav.dashboard"), icon: Home },
      { href: "/collect", label: t("nav.collect"), icon: Wallet },
      { href: "/onboard", label: t("nav.onboard"), icon: UserPlus },
      { href: "/fleet", label: t("nav.fleet"), icon: Users },
    ];
  }, [user, t]);

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
