"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment, Alert as AlertType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BadgeCheck, Bell, CalendarClock, ChevronRight, Ban } from "lucide-react";
import { differenceInDays, isBefore, parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";


const StatCard = ({ title, value, subtext, colorClass, isLoading }: { title: string, value: string, subtext: string, colorClass: string, isLoading?: boolean }) => (
  <Card className="text-center">
    <CardHeader className="p-4">
      <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{title}</p>
      {isLoading ? <Skeleton className="h-9 w-20 mx-auto mt-1" /> : <p className={`text-3xl font-extrabold ${colorClass}`}>{value}</p>}
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </CardHeader>
  </Card>
);

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
            totalOwed: null, expiringSoonCount: null, alerts: []
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
          message: `${rider.name} - not paid today`,
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
          message: `${rider.name}'s contract is expiring in ${daysUntilExpiry} days.`,
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
      alerts: generatedAlerts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    };
  }, [riders, payments, clientNow, allPayments]);
  
  const { monthEarnings, totalCollected, totalOwed, expiringSoonCount, alerts } = dashboardStats;
  const isLoading = monthEarnings === null;
  const isRider = user?.role === 'rider';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard isLoading={isLoading} title={isRider ? "My Earnings" : "Month Earnings"} value={formatCurrency(monthEarnings)} subtext="TZS this month" colorClass="text-primary" />
        <StatCard isLoading={isLoading} title={isRider ? "My Payments" : "Total Collected"} value={formatCurrency(totalCollected)} subtext="TZS all time" colorClass="text-accent" />
        {!isRider && <StatCard isLoading={isLoading} title="Total Owed" value={formatCurrency(totalOwed)} subtext="TZS outstanding" colorClass="text-destructive" />}
        {!isRider && <StatCard isLoading={isLoading} title="Expiring Soon" value={expiringSoonCount?.toString() ?? ''} subtext="contracts (30 days)" colorClass="text-foreground" />}
      </div>

      <div>
        <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Alerts</h2>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map(alert => (
              <Link href="/fleet" key={alert.id}>
                <div className={`p-3 rounded-lg flex items-center justify-between ${alert.type === 'payment' ? 'bg-[#fdecea] text-[#c0392b]' : 'bg-[#fff8e8] text-[#c8860a]'}`}>
                  <div className="flex items-center gap-3">
                    {alert.type === 'payment' ? <Ban size={20} /> : <CalendarClock size={20} />}
                    <div>
                      <p className="font-bold text-sm">{alert.message}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-10 border-dashed">
            <CardHeader>
                <div className="text-4xl mx-auto">✅</div>
                <CardTitle className="font-headline text-lg">All Clear!</CardTitle>
                <p className="text-muted-foreground text-sm">No alerts right now. Everything looks good.</p>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
