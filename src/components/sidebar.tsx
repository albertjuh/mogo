
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, AlertCircle, UserPlus, ShieldAlert, UserCircle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();

  const navItems = useMemo(() => {
    if (!user) return [];

    const accountItem = { href: "/account", label: "Account", icon: UserCircle };

    if (user.role === 'rider') {
      return [
        { href: "/", label: "My Dashboard", icon: Home },
        { href: "/vault", label: "Document Vault", icon: ShieldCheck },
        { href: "/savings", label: "Savings Tracker", icon: TrendingUp },
        { href: "/payments", label: "Payment History", icon: BarChart3 },
        accountItem,
      ];
    }

    if (user.role === 'recruiter') {
      return [
        { href: "/", label: "Home", icon: Home },
        { href: "/onboard", label: "New Onboarding", icon: UserPlus },
        { href: "/fleet", label: "Fleet List", icon: Users },
        accountItem,
      ];
    }

    const supervisorItems = [
      { href: "/", label: "Fleet Stats", icon: Home },
      { href: "/collect", label: "Daily Collection", icon: Wallet },
      { href: "/onboard", label: "New Onboarding", icon: UserPlus },
      { href: "/fleet", label: "Manage Fleet", icon: Users },
      { href: "/payments", label: "Payment Log", icon: BarChart3 },
      { href: "/alerts", label: "Urgent Alerts", icon: AlertCircle },
    ];

    if (user.role === 'supervisor') return [...supervisorItems, accountItem];

    return [
      ...supervisorItems,
      { href: "/users", label: "User Accounts", icon: ShieldAlert },
      { href: "/payouts", label: "Withdraw Funds", icon: Banknote },
      { href: "/reports", label: "Business Insights", icon: TrendingUp },
      accountItem,
    ];
  }, [user]);

  if (!user) return null;

  const displayName = user.name || user.email.split('@')[0];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        <div className="h-20 flex items-center px-5 bg-accent border-b-2 border-gold">
            <Link href="/" className="flex items-center">
                <BrandLogo size={48} tone="light" priority />
            </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = (pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href));
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                )}
                >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                </Link>
            );
            })}
        </nav>
        <div className="p-4 border-t">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-[0.6rem] text-muted-foreground uppercase font-black tracking-widest">{user.role}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </aside>
  );
}
