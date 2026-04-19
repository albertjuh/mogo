
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Flame, AlertTriangle, TrendingUp, CheckCircle2, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentSlot = {
  dueDate: Date;
  status: 'paid-on-time' | 'paid-late' | 'unpaid' | 'overpaid';
  amountCovered: number;
  actualPaymentDate?: string;
};

export default function PaymentsPage() {
  const { user } = useUser();
  const [allPayments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const filteredRiders = useMemo(() => {
    if (user?.role === 'rider') {
      return riders.filter(r => r.id === user.id);
    }
    return riders.filter(r => r.active);
  }, [riders, user]);

  const riderStats = useMemo(() => {
    if (!clientNow) return [];

    return filteredRiders.map(rider => {
      const riderPayments = allPayments
        .filter(p => p.riderId === rider.id)
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      
      const start = startOfDay(parseISO(rider.contractStart));
      const end = startOfDay(clientNow);
      
      let intervals: Date[] = [];
      if (rider.paymentFrequency === 'Weekly') {
        intervals = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
      } else {
        intervals = eachDayOfInterval({ start, end });
      }

      const slots: PaymentSlot[] = [];
      let totalPaidRemaining = riderPayments.reduce((sum, p) => sum + p.amount, 0);
      const fee = rider.dailyFee;

      intervals.forEach((dueDate) => {
        if (totalPaidRemaining >= fee) {
          // Find the payment that covered this. For simplicity, we look for payments on or after this due date
          const coveringPayment = riderPayments.find(p => {
             const pDate = startOfDay(parseISO(p.date));
             return isSameDay(pDate, dueDate) || isBefore(dueDate, pDate);
          });

          slots.push({
            dueDate,
            status: coveringPayment && isSameDay(startOfDay(parseISO(coveringPayment.date)), dueDate) ? 'paid-on-time' : 'paid-late',
            amountCovered: fee,
            actualPaymentDate: coveringPayment?.date
          });
          totalPaidRemaining -= fee;
        } else {
          slots.push({
            dueDate,
            status: 'unpaid',
            amountCovered: 0
          });
        }
      });

      const isOverpaid = totalPaidRemaining > 0;
      const hasDebt = slots.some(s => s.status === 'unpaid');

      return {
        rider,
        slots: slots.reverse(), // Newest first
        totalPaidRemaining,
        isOverpaid,
        hasDebt
      };
    });
  }, [filteredRiders, allPayments, clientNow]);

  if (!clientNow) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Payment Ledger</h1>
        <p className="text-muted-foreground font-medium">Tracking every cent of the Mogo Empire.</p>
      </header>

      {riderStats.map(({ rider, slots, totalPaidRemaining, isOverpaid, hasDebt }) => (
        <Card key={rider.id} className={cn(
          "border-none shadow-xl transition-all duration-500",
          hasDebt ? "bg-red-50 ring-2 ring-red-500 animate-pulse" : "",
          isOverpaid ? "bg-green-50 ring-2 ring-primary" : ""
        )}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-black text-2xl italic uppercase flex items-center gap-2">
                  {rider.name}
                  {hasDebt && <Ghost className="text-red-600 animate-bounce" />}
                  {isOverpaid && <Flame className="text-orange-500 animate-pulse" />}
                </CardTitle>
                <CardDescription className="font-bold text-xs">
                  {rider.plateNumber} • {rider.paymentFrequency} Plan (TZS {rider.dailyFee.toLocaleString()})
                </CardDescription>
              </div>
              <div className="text-right">
                {hasDebt ? (
                   <Badge variant="destructive" className="font-black animate-pulse px-4 py-1 text-sm">
                     <AlertTriangle className="mr-2 h-4 w-4" /> TERROR: DEBT DETECTED!
                   </Badge>
                ) : isOverpaid ? (
                   <Badge className="bg-orange-500 hover:bg-orange-600 font-black px-4 py-1 text-sm text-white">
                     <Flame className="mr-2 h-4 w-4" /> MOTO SANA! OVERACHIEVER!
                   </Badge>
                ) : (
                   <Badge className="bg-primary font-black px-4 py-1 text-sm">
                     <CheckCircle2 className="mr-2 h-4 w-4" /> ALL CLEAR
                   </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isOverpaid && (
              <div className="mb-4 p-3 bg-primary/20 rounded-xl border-2 border-primary border-dashed text-center">
                <p className="font-black text-primary italic text-lg uppercase tracking-widest animate-bounce">
                  + TZS {totalPaidRemaining.toLocaleString()} EXTRA! THIS DRIVER WORKS HARD! 🚀
                </p>
              </div>
            )}
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {slots.map((slot, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                    slot.status === 'unpaid' && "bg-red-600 text-white border-red-800 shadow-lg scale-[0.98]",
                    slot.status === 'paid-on-time' && "bg-white border-primary/20",
                    slot.status === 'paid-late' && "bg-yellow-50 border-yellow-400 text-yellow-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-black",
                      slot.status === 'unpaid' ? "bg-white text-red-600 animate-ping" : "bg-secondary text-muted-foreground"
                    )}>
                      {format(slot.dueDate, "dd")}
                    </div>
                    <div>
                      <p className="font-black uppercase italic leading-none">{format(slot.dueDate, "MMMM yyyy")}</p>
                      <p className="text-[0.6rem] font-bold opacity-80 uppercase tracking-widest mt-1">
                        {slot.status === 'unpaid' ? "MISSED PAYMENT - TERROR!" : 
                         slot.status === 'paid-late' ? `DEBT COVERED ON ${format(parseISO(slot.actualPaymentDate!), "dd MMM")}` :
                         "CLEAN ON-TIME PAYMENT"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg leading-none">TZS {rider.dailyFee.toLocaleString()}</p>
                    {slot.status === 'unpaid' && <p className="text-[0.6rem] font-bold uppercase animate-pulse">Pay immediately!</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
