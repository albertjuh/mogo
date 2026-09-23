"use client";

import { Home, Wallet, ShieldCheck, TrendingUp, Users, BarChart3, AlertCircle, UserPlus, ShieldAlert, UserCircle, Banknote, MapPin, type LucideIcon } from "lucide-react";
import { useUser } from "@/supabase/auth/use-user";
import { useLanguage } from "@/lib/i18n/language-context";
import { useMemo } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** The full role-scoped nav menu -- shared by the desktop Sidebar and the mobile "More" drawer. */
export function useNavItems(): NavItem[] {
  const { user } = useUser();
  const { t } = useLanguage();

  return useMemo(() => {
    if (!user) return [];

    const accountItem: NavItem = { href: "/account", label: t("nav.account"), icon: UserCircle };

    if (user.role === 'rider') {
      return [
        { href: "/", label: t("nav.myDashboard"), icon: Home },
        { href: "/vault", label: t("nav.vault"), icon: ShieldCheck },
        { href: "/savings", label: t("nav.savings"), icon: TrendingUp },
        { href: "/payments", label: t("nav.paymentHistory"), icon: BarChart3 },
        accountItem,
      ];
    }

    if (user.role === 'recruiter') {
      return [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/onboard", label: t("nav.onboard"), icon: UserPlus },
        { href: "/fleet", label: t("nav.fleetList"), icon: Users },
        accountItem,
      ];
    }

    const supervisorItems: NavItem[] = [
      { href: "/", label: t("nav.dashboard"), icon: Home },
      { href: "/collect", label: t("nav.collect"), icon: Wallet },
      { href: "/onboard", label: t("nav.onboard"), icon: UserPlus },
      { href: "/fleet", label: t("nav.fleet"), icon: Users },
      { href: "/map", label: t("nav.map"), icon: MapPin },
      { href: "/payments", label: t("nav.payments"), icon: BarChart3 },
      { href: "/alerts", label: t("nav.alerts"), icon: AlertCircle },
    ];

    if (user.role === 'supervisor') return [...supervisorItems, accountItem];

    return [
      ...supervisorItems,
      { href: "/users", label: t("nav.users"), icon: ShieldAlert },
      { href: "/payouts", label: t("nav.payouts"), icon: Banknote },
      { href: "/reports", label: t("nav.reports"), icon: TrendingUp },
      accountItem,
    ];
  }, [user, t]);
}
