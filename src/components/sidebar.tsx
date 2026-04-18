"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/fleet", label: "Fleet", icon: "🏍️" },
  { href: "/collect", label: "Collect", icon: "💰" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/plan", label: "Plan", icon: "📈" },
  { href: "/map", label: "Map", icon: "🗺️" },
];

const riderNavItems = [
    { href: "/", label: "Dashboard", icon: "🏠" },
    { href: "/payments", label: "Payments", icon: "💰" },
];


export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();

  if (!user) {
    return null;
  }

  const navItems = user.role === 'rider' ? riderNavItems : adminNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        <div className="h-16 flex items-center px-6 border-b">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                 <div className="text-lg" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900}}>
                    <span>🏍 Boda </span>
                    <span className="text-primary">Empire</span>
                </div>
            </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
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
                <div className="text-xl">{item.icon}</div>
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
