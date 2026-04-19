"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, AlertCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();

  const navItems = useMemo(() => {
    if (!user) return [];

    if (user.role === 'rider') {
      return [
        { href: "/", label: "My Dashboard", icon: Home },
        // Removed Lipa Sasa from here as it's the primary action on the Home Dashboard
        { href: "/vault", label: "Document Vault", icon: ShieldCheck },
        { href: "/savings", label: "Savings Tracker", icon: TrendingUp },
        { href: "/payments", label: "Payment History", icon: BarChart3 },
      ];
    }

    if (user.role === 'recruiter') {
      return [
        { href: "/", label: "Recruitment Overview", icon: Home },
        { href: "/fleet", label: "Onboard Riders", icon: UserPlus },
      ];
    }

    // Supervisor Nav
    const supervisorItems = [
      { href: "/", label: "Fleet Stats", icon: Home },
      { href: "/collect", label: "Daily Collection", icon: Wallet },
      { href: "/fleet", label: "Manage Fleet", icon: Users },
      { href: "/payments", label: "Payment Log", icon: BarChart3 },
      { href: "/alerts", label: "Urgent Alerts", icon: AlertCircle },
    ];

    if (user.role === 'supervisor') return supervisorItems;

    // Admin adds Reports and Planning
    return [
      ...supervisorItems,
      { href: "/reports", label: "Business Insights", icon: TrendingUp },
      { href: "/growth", label: "Growth Planning", icon: TrendingUp },
    ];
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        <div className="h-16 flex items-center px-6 border-b">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                 <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
                    <span className="italic text-primary">mogo </span>
                    <span className="text-accent font-light text-xs opacity-80">Connect</span>
                </div>
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
                    {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.email.split('@')[0]}</p>
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