
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, UserPlus, Menu, LogOut } from "lucide-react";
import { useUser } from "@/supabase/auth/use-user";
import { useLanguage } from "@/lib/i18n/language-context";
import { useNavItems } from "@/hooks/use-nav-items";
import { useMemo, useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const allNavItems = useNavItems();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = useMemo(() => {
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

  // Everything in the full nav that isn't already a primary bottom-bar item.
  const moreItems = useMemo(
    () => allNavItems.filter((item) => !primaryItems.some((p) => p.href === item.href)),
    [allNavItems, primaryItems]
  );

  if (!user) return null;

  const isActive = (href: string) => (pathname === '/' && href === '/') || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 z-10 w-full border-t border-t-muted bg-white pb-safe">
        <div className="flex h-16 items-center justify-around">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors",
                  active && "text-primary"
                )}
              >
                <Icon size={20} className={cn(active && "fill-current/10")} />
                <span className="text-[0.60rem] font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
          {moreItems.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
            >
              <Menu size={20} />
              <span className="text-[0.60rem] font-bold uppercase tracking-wider">{t("nav.more")}</span>
            </button>
          )}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="md:hidden rounded-t-2xl pb-safe max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("nav.more")}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-muted-foreground transition-colors",
                    active ? "border-primary text-primary bg-primary/5" : "border-transparent bg-secondary/40 hover:text-primary"
                  )}
                >
                  <Icon size={22} />
                  <span className="text-[0.65rem] font-bold uppercase tracking-wide text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <LanguageToggle className="bg-secondary/50" />
            <button
              type="button"
              onClick={() => { setMoreOpen(false); logout(); }}
              className="flex items-center gap-2 text-sm font-bold text-destructive"
            >
              <LogOut size={16} /> {t("nav.signOut")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
