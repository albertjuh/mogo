
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, differenceInDays, differenceInWeeks } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CollectPage() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments, setPayments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const { toast } = useToast();

  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const todayStr = useMemo(() => clientNow ? format(clientNow, 'yyyy-MM-dd') : '', [clientNow]);
  const headerDate = useMemo(() => clientNow ? format(clientNow, 'eeee, dd MMMM') : 'Loading...', [clientNow]);
  
  const ridersWithStatus = useMemo(() => {
    if (!clientNow || !todayStr) return [];
    return riders.filter(r => r.active).map(rider => {
      const riderPayments = payments.filter(p => p.riderId === rider.id);
      const paidToday = riderPayments.some(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr);
      
      // Calculate automated balance
      const start = parseISO(rider.contractStart);
      let totalOwed = 0;
      
      if (rider.paymentFrequency === 'Weekly') {
        const weeksElapsed = differenceInWeeks(clientNow, start);
        totalOwed = weeksElapsed > 0 ? weeksElapsed * rider.dailyFee : 0;
      } else {
        const daysElapsed = differenceInDays(clientNow, start);
        totalOwed = daysElapsed > 0 ? daysElapsed * rider.dailyFee : 0;
      }

      const totalPaid = riderPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalPaid - totalOwed;

      return { ...rider, paidToday, balance };
    });
  }, [riders, payments, clientNow, todayStr]);
  
  const [paidTodayCount, tzsToday] = useMemo(() => {
    if (!todayStr) return [0, 0];
    const todaysPayments = payments.filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === todayStr);
    const count = new Set(todaysPayments.map(p => p.riderId)).size;
    const total = todaysPayments.reduce((sum, p) => sum + p.amount, 0);
    return [count, total];
  }, [payments, todayStr]);

  const handlePaymentToggle = (riderId: string, dailyFee: number, isPaid: boolean) => {
    if (!todayStr) return;
    if (isPaid) {
      // Remove payment for today
      setPayments(prev => prev.filter(p => !(p.riderId === riderId && format(parseISO(p.date), 'yyyy-MM-dd') === todayStr)));
      toast({ title: "Payment Removed" });
    } else {
      // Add payment for today
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        riderId,
        amount: dailyFee,
        date: new Date().toISOString(),
      };
      setPayments(prev => [...prev, newPayment]);
      toast({ title: "💰 Malipo Yamepokelewa!" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-6 rounded-b-3xl">
        <p className="text-sm uppercase text-white/60 font-bold tracking-widest">{headerDate}</p>
        <h1 className="font-black text-3xl my-1 italic uppercase">Daily Collection</h1>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                <p className="text-xl font-bold">{paidTodayCount}</p>
                <p className="text-[0.6rem] uppercase font-semibold text-white/60">Paid</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                <p className="text-xl font-bold">{riders.filter(r => r.active).length - paidTodayCount}</p>
                <p className="text-[0.6rem] uppercase font-semibold text-white/60">Missing</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                <p className="text-xl font-bold">{(tzsToday / 1000).toFixed(0)}K</p>
                <p className="text-[0.6rem] uppercase font-semibold text-white/60">Collected</p>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {ridersWithStatus.map(rider => (
          <Card key={rider.id} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <p className="font-bold">{rider.name}</p>
                    <Badge variant="secondary" className="text-[0.6rem] px-1.5 py-0 h-4">
                        {rider.paymentFrequency}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{rider.plateNumber}</p>
                {rider.balance < 0 ? (
                   <p className="text-xs text-destructive font-bold flex items-center gap-1">
                       ⚠ Owed: TZS {Math.abs(rider.balance).toLocaleString()}
                   </p>
                ) : (
                   <p className="text-xs text-primary font-semibold flex items-center gap-1">
                       ✓ Paid Up
                   </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className={cn("text-xs font-black uppercase", rider.paidToday ? 'text-primary' : 'text-muted-foreground')}>
                        {rider.paidToday ? 'Leo OK' : 'No Entry'}
                    </p>
                    <p className="text-[0.6rem] text-muted-foreground font-bold">{rider.dailyFee.toLocaleString()}</p>
                </div>
                <Switch
                  className="data-[state=checked]:bg-primary"
                  checked={rider.paidToday}
                  onCheckedChange={(isChecked) => handlePaymentToggle(rider.id, rider.dailyFee, !isChecked)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
