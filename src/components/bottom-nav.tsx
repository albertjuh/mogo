"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/fleet", label: "Fleet", icon: "🏍️" },
  { href: "/collect", label: "Collect", icon: "💰" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/plan", label: "Plan", icon: "📈" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute bottom-0 z-10 w-full border-t border-t-white/10 bg-[#0d1117]">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[#6b7280] transition-transform duration-200",
                isActive && "text-[#f5c842]"
              )}
            >
              <div className={cn("text-2xl transition-transform", isActive && "-translate-y-0.5")}>{item.icon}</div>
              <span className="text-[0.60rem] font-semibold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
