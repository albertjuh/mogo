"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment, Alert as AlertType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BadgeCheck, Bell, CalendarClock, ChevronRight, Ban } from "lucide-react";
import { differenceInDays, isBefore, parseISO, format, differenceInCalendarMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const StatCard = ({ title, value, subtext, colorClass }: { title: string, value: string, subtext: string, colorClass: string }) => (
  <Card className="text-center">
    <CardHeader className="p-4">
      <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{title}</p>
      <p className={`text-3xl font-extrabold ${colorClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </CardHeader>
  </Card>
);

export default function DashboardPage() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);

  const {
    activeBodas,
    paidTodayCount,
    missingCount,
    tzsToday,
    monthEarnings,
    totalCollected,
    totalOwed,
    expiringSoonCount
  } = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const activeRiders = riders.filter(r => r.active);
    
    const paidToday = new Set(payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId));
    
    const tzsToday = payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).reduce((sum, p) => sum + p.amount, 0);

    const currentMonthInterval = { start: startOfMonth(today), end: endOfMonth(today) };
    const monthEarnings = payments
      .filter(p => isWithinInterval(parseISO(p.date), currentMonthInterval))
      .reduce((sum, p) => sum + p.amount, 0);
      
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    const totalOwed = activeRiders.reduce((total, rider) => {
        const daysElapsed = differenceInDays(today, parseISO(rider.contractStart));
        const expected = daysElapsed > 0 ? daysElapsed * rider.dailyFee : 0;
        const paid = payments.filter(p => p.riderId === rider.id).reduce((sum, p) => sum + p.amount, 0);
        const owed = expected - paid;
        return total + (owed > 0 ? owed : 0);
    }, 0);
    
    const expiringSoonCount = activeRiders.filter(r => {
        const daysUntilExpiry = differenceInDays(parseISO(r.contractEnd), today);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }).length;

    return {
      activeBodas: activeRiders.length,
      paidTodayCount: paidToday.size,
      missingCount: activeRiders.length - paidToday.size,
      tzsToday,
      monthEarnings,
      totalCollected,
      totalOwed,
      expiringSoonCount,
    };
  }, [riders, payments]);

  const alerts = useMemo((): AlertType[] => {
    const generatedAlerts: AlertType[] = [];
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const paidTodayRiderIds = new Set(payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr).map(p => p.riderId));

    riders.forEach(rider => {
      // Unpaid today alert
      if (rider.active && !paidTodayRiderIds.has(rider.id)) {
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

    return generatedAlerts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [riders, payments]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
    return amount.toString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-6 rounded-b-3xl" style={{background: 'radial-gradient(ellipse 80% 80% at 80% 100%, #1a3015 0%, transparent 60%), #0d1117'}}>
          <p className="text-sm uppercase text-[#a09080] font-bold tracking-widest">Fleet Status</p>
          <p className="font-black text-6xl text-[#f5c842] my-1">{activeBodas}</p>
          <p className="text-sm text-[#a09080] font-semibold -mt-2">active bodas</p>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{paidTodayCount}</p>
                  <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Paid Today</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{missingCount}</p>
                  <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Missing</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{formatCurrency(tzsToday)}</p>
                  <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">TZS Today</p>
              </div>
          </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Month Earnings" value={formatCurrency(monthEarnings)} subtext="TZS this month" colorClass="text-primary" />
        <StatCard title="Total Collected" value={formatCurrency(totalCollected)} subtext="TZS all time" colorClass="text-accent" />
        <StatCard title="Total Owed" value={formatCurrency(totalOwed)} subtext="TZS outstanding" colorClass="text-destructive" />
        <StatCard title="Expiring Soon" value={expiringSoonCount.toString()} subtext="contracts (30 days)" colorClass="text-foreground" />
      </div>

      <div>
        <h2 className="text-xs uppercase text-muted-foreground font-bold tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Alerts</h2>
        {alerts.length > 0 ? (
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
