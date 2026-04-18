
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment, Alert as AlertType } from "@/lib/types";
import { AlertTriangle, CalendarClock, Ban, ChevronRight, BarChart3, Users, DollarSign, AlertCircle } from "lucide-react";
import { differenceInDays, isBefore, parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

const StatCard = ({ title, value, subtext, icon, href, isLoading }: { title: string, value: string, subtext: string, icon: React.ReactNode, href?: string, isLoading?: boolean }) => {
  const content = (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-9 w-20 mt-1" /> : <div className="text-2xl font-bold">{value}</div>}
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};


export default function DashboardPage() {
  const { user } = useUser();
  const [allRiders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [allPayments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const { riders, payments } = useMemo(() => {
    if (user?.role === 'rider') {
      return {
        riders: allRiders.filter(r => r.id === user.id),
        payments: allPayments.filter(p => p.riderId === user.id),
      };
    }
    return { riders: allRiders, payments: allPayments };
  }, [allRiders, allPayments, user]);

  const dashboardStats = useMemo(() => {
    if (!clientNow || !riders || !payments) {
        return {
            monthEarnings: null, totalCollected: null,
            totalOwed: null, expiringSoonCount: null, alerts: [], activeRidersCount: null,
        };
    }
    const today = clientNow;
    const todayStr = format(today, 'yyyy-MM-dd');
    const activeRiders = riders.filter(r => r.active);
    
    const paidToday = new Set(payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId));
    
    const currentMonthInterval = { start: startOfMonth(today), end: endOfMonth(today) };
    const monthEarnings = payments
      .filter(p => isWithinInterval(parseISO(p.date), currentMonthInterval))
      .reduce((sum, p) => sum + p.amount, 0);
      
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    const totalOwed = activeRiders.reduce((total, rider) => {
        const daysElapsed = differenceInDays(today, parseISO(rider.contractStart));
        const expected = daysElapsed > 0 ? daysElapsed * rider.dailyFee : 0;
        const paid = allPayments.filter(p => p.riderId === rider.id).reduce((sum, p) => sum + p.amount, 0);
        const owed = expected - paid;
        return total + (owed > 0 ? owed : 0);
    }, 0);
    
    const expiringSoonCount = activeRiders.filter(r => {
        const daysUntilExpiry = differenceInDays(parseISO(r.contractEnd), today);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }).length;

    const generatedAlerts: AlertType[] = [];
    activeRiders.forEach(rider => {
      // Unpaid today alert
      if (!paidToday.has(rider.id)) {
        generatedAlerts.push({
          id: `payment-${rider.id}`,
          type: 'payment',
          message: `${rider.name} has a pending payment.`,
          date: new Date().toISOString(),
          riderId: rider.id,
        });
      }

      // Contract expiration alerts
      const contractEndDate = parseISO(rider.contractEnd);
      const daysUntilExpiry = differenceInDays(contractEndDate, today);
      if (rider.active && daysUntilExpiry <= 30 && isBefore(today, contractEndDate)) {
        generatedAlerts.push({
          id: `contract-${rider.id}`,
          type: 'contract',
          message: `${rider.name}'s contract expires in ${daysUntilExpiry} days.`,
          date: new Date().toISOString(),
          riderId: rider.id,
        });
      }
    });

    return {
      monthEarnings,
      totalCollected,
      totalOwed,
      expiringSoonCount,
      alerts: generatedAlerts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
      activeRidersCount: activeRiders.length,
    };
  }, [riders, payments, clientNow, allPayments]);
  
  const { monthEarnings, totalCollected, totalOwed, expiringSoonCount, alerts, activeRidersCount } = dashboardStats;
  const isLoading = monthEarnings === null;
  const isRider = user?.role === 'rider';

  if (isRider) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard isLoading={isLoading} title="My Earnings (Month)" value={formatCurrency(monthEarnings)} subtext="TZS this month" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} href="/payments" />
                <StatCard isLoading={isLoading} title="My Payments (All Time)" value={formatCurrency(totalCollected)} subtext="TZS all time" icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} href="/payments" />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : alerts.length > 0 ? (
                        <div className="space-y-2">
                            {alerts.map(alert => (
                            <Link href="/payments" key={alert.id}>
                                <div className="p-3 rounded-lg flex items-center justify-between bg-muted hover:bg-muted/80">
                                <div className="flex items-center gap-3">
                                    {alert.type === 'payment' ? <Ban size={20} className="text-destructive" /> : <CalendarClock size={20} className="text-primary"/>}
                                    <div>
                                        <p className="font-medium text-sm">{alert.message}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} />
                                </div>
                            </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <div className="text-4xl mx-auto mb-2">✅</div>
                            <p className="font-semibold">All Clear!</p>
                            <p className="text-sm">No alerts right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard isLoading={isLoading} title="Revenue (Month)" value={formatCurrency(monthEarnings)} subtext="TZS this month" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} href="/reports"/>
            <StatCard isLoading={isLoading} title="Active Riders" value={activeRidersCount?.toString() ?? ''} subtext="riders in the fleet" icon={<Users className="h-4 w-4 text-muted-foreground" />} href="/fleet"/>
            <StatCard isLoading={isLoading} title="Owed by Riders" value={formatCurrency(totalOwed)} subtext="TZS outstanding" icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}/>
            <StatCard isLoading={isLoading} title="Contracts Expiring" value={expiringSoonCount?.toString() ?? ''} subtext="in next 30 days" icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />} href="/alerts"/>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-primary"/>
                    <span>High-Priority Alerts</span>
                </CardTitle>
                <CardDescription>Actionable insights to keep your fleet running smoothly.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : alerts.length > 0 ? (
                <div className="space-y-2">
                    {alerts.map(alert => (
                    <Link href={alert.type === 'payment' ? '/collect' : '/fleet'} key={alert.id}>
                        <div className="p-3 rounded-lg flex items-center justify-between bg-secondary hover:bg-secondary/80">
                        <div className="flex items-center gap-3">
                            {alert.type === 'payment' ? <Ban size={20} className="text-destructive" /> : <CalendarClock size={20} className="text-primary"/>}
                            <div>
                                <p className="font-medium text-sm">{alert.message}</p>
                            </div>
                        </div>
                        <ChevronRight size={16} />
                        </div>
                    </Link>
                    ))}
                </div>
                ) : (
                <div className="text-center text-muted-foreground py-10">
                    <div className="text-4xl mx-auto mb-2">✅</div>
                    <p className="font-semibold">All Clear!</p>
                    <p className="text-sm">No alerts right now.</p>
                </div>
                )}
            </CardContent>
        </Card>

    </div>
  );
}

    