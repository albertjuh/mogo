"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import { Sidebar } from "./sidebar";

export function AppClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  return (
    <div className="w-full bg-muted">
        <AuthGuard>
            <div className="md:flex min-h-screen w-full">
                <Sidebar />
                <div className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col bg-background shadow-lg h-dvh md:max-w-none md:mx-0 md:h-screen md:shadow-none">
                    <AppHeader />
                    {isDashboard && <DashboardHeader />}
                    <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-6">
                        {children}
                    </main>
                    <BottomNav />
                </div>
            </div>
        </AuthGuard>
    </div>
  );
}
