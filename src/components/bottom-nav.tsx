"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Fleet", icon: "🏍️" },
  { href: "/payments", label: "Payments", icon: "💰" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/growth", label: "Growth", icon: "🚀" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
              pathname === item.href && "text-primary"
            )}
          >
            <div className="text-2xl transition-transform group-hover:scale-110">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
