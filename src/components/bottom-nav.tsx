"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, ShieldCheck, TrendingUp, Info } from "lucide-react";

const navItems = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/lipa", label: "Lipa", icon: Wallet },
  { href: "/vault", label: "Nyaraka", icon: ShieldCheck },
  { href: "/savings", label: "Faida", icon: TrendingUp },
  { href: "/about", label: "Mogo", icon: Info },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden absolute bottom-0 z-10 w-full border-t border-t-muted bg-white pb-safe">
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
              <Icon size={24} className={cn(isActive && "fill-current/10")} />
              <span className="text-[0.60rem] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
