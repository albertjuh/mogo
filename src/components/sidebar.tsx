
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/supabase/auth/use-user";
import { Button } from "@/components/ui/button";
import { BrandLogo, BrandShield } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";
import { useNavItems } from "@/hooks/use-nav-items";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const navItems = useNavItems();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  if (!user) return null;

  const displayName = user.name || user.email.split('@')[0];

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden md:flex flex-col bg-background border-r transition-[width] duration-300 shrink-0",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="h-20 flex items-center px-5 bg-accent border-b-2 border-gold relative">
          <Link href="/" className="flex items-center overflow-hidden">
            {collapsed ? <BrandShield size={36} priority /> : <BrandLogo size={48} tone="light" priority />}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = (pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href));
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (!collapsed) return link;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={cn("w-full text-muted-foreground hover:text-primary", collapsed ? "px-0 justify-center" : "justify-start gap-2")}
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            title={collapsed ? t("nav.expand") : t("nav.collapse")}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-xs font-bold uppercase tracking-wider">{t("nav.collapse")}</span>}
          </Button>

          {!collapsed && <LanguageToggle className="bg-muted w-full justify-center" />}

          <div className={cn("flex items-center gap-3", collapsed && "flex-col gap-2")}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-accent text-white flex items-center justify-center font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-[0.6rem] text-muted-foreground uppercase font-black tracking-widest">{t(`role.${user.role}`)}</p>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-full shrink-0" aria-label={t("nav.signOut")}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{t("nav.signOut")}</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
