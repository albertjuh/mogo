"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
      
      const daysElapsed = differenceInDays(clientNow, parseISO(rider.contractStart));
      const totalOwed = daysElapsed > 0 ? daysElapsed * rider.dailyFee : 0;
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
      toast({ title: "💰 Payment Recorded" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-6 rounded-b-3xl">
        <p className="text-sm uppercase text-[#a09080] font-bold tracking-widest">{headerDate}</p>
        <h1 className="font-black text-3xl my-1">Daily Collection</h1>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-white/10 rounded-lg p-2">
                <p className="text-xl font-bold">{paidTodayCount}</p>
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Paid</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
                <p className="text-xl font-bold">{riders.filter(r => r.active).length - paidTodayCount}</p>
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Missing</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
                <p className="text-xl font-bold">{tzsToday.toLocaleString()}</p>
                <p className="text-[0.6rem] uppercase font-semibold text-[#a09080]">Collected</p>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {ridersWithStatus.map(rider => (
          <Card key={rider.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{rider.name}</p>
                <p className="text-sm text-muted-foreground">{rider.plateNumber}</p>
                {rider.balance < 0 && (
                   <p className="text-xs text-destructive font-bold">⚠ Owes TZS {Math.abs(rider.balance).toLocaleString()}</p>
                )}
                 {rider.balance >= 0 && (
                   <p className="text-xs text-accent font-semibold">✓ Account clear</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold uppercase ${rider.paidToday ? 'text-accent' : 'text-muted-foreground'}`}>
                  {rider.paidToday ? 'Paid' : '—'}
                </span>
                <Switch
                  className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-border"
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
