"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { DashboardHeader } from "./dashboard-header";

export function AppClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  return (
    <div className="relative mx-auto flex w-full max-w-[480px] flex-col bg-background shadow-lg sm:my-4 sm:rounded-lg h-dvh">
      <AuthGuard>
        <AppHeader />
        {isDashboard && <DashboardHeader />}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24">
          {children}
        </main>
        <BottomNav />
      </AuthGuard>
    </div>
  );
}
