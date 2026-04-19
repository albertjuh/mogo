"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Wallet, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/lipa", label: "Lipa Sasa", icon: Wallet },
  { href: "/vault", label: "Document Vault", icon: ShieldCheck },
  { href: "/savings", label: "Savings Tracker", icon: TrendingUp },
  { href: "/about", label: "About Mogo", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        <div className="h-16 flex items-center px-6 border-b">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                 <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
                    <span>🏍 Mogo </span>
                    <span className="text-primary">Connect</span>
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
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                    {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </aside>
  );
}
