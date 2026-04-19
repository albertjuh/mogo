
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, TrendingUp, Calendar, Ghost, Flame } from "lucide-react";
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
        slots: slots.reverse(),
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
        <p className="text-muted-foreground font-medium">Official payment records and status tracking.</p>
      </header>

      {riderStats.map(({ rider, slots, totalPaidRemaining, isOverpaid, hasDebt }) => (
        <Card key={rider.id} className={cn(
          "border-none shadow-xl transition-all duration-500 overflow-hidden",
          hasDebt ? "ring-1 ring-red-100" : isOverpaid ? "ring-1 ring-primary/20" : ""
        )}>
          <CardHeader className={cn(
              "pb-4 border-b",
              hasDebt ? "bg-red-50/30" : isOverpaid ? "bg-green-50/30" : "bg-muted/10"
          )}>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-black text-2xl italic uppercase flex items-center gap-2">
                  {rider.name}
                  {hasDebt && <Ghost className="text-red-300 h-5 w-5 animate-bounce" />}
                  {isOverpaid && <Flame className="text-primary h-5 w-5 animate-pulse" />}
                </CardTitle>
                <CardDescription className="font-bold text-xs">
                  {rider.plateNumber} • {rider.paymentFrequency} Plan (TZS {rider.dailyFee.toLocaleString()})
                </CardDescription>
              </div>
              <div className="text-right">
                {hasDebt ? (
                   <Badge variant="destructive" className="font-black px-4 py-1 text-[0.6rem] tracking-widest">
                     DEBT DETECTED
                   </Badge>
                ) : isOverpaid ? (
                   <Badge className="bg-primary font-black px-4 py-1 text-[0.6rem] tracking-widest text-white">
                     BOSSI! MOTO SANA!
                   </Badge>
                ) : (
                   <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 text-[0.6rem] tracking-widest">
                     STABLE
                   </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isOverpaid && (
              <div className="p-3 bg-primary/10 border-b border-primary/10 text-center">
                <p className="font-black text-primary italic text-[0.7rem] uppercase tracking-widest">
                  OVERACHIEVER: + TZS {totalPaidRemaining.toLocaleString()} ACCOUNT CREDIT
                </p>
              </div>
            )}
            
            <div className="divide-y max-h-[500px] overflow-y-auto pr-0 custom-scrollbar">
              {slots.map((slot, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors hover:bg-muted/5",
                    slot.status === 'unpaid' ? "bg-white" : "bg-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black border",
                      slot.status === 'unpaid' ? "bg-muted/50 border-muted-foreground/10 text-muted-foreground/60" : "bg-primary/5 border-primary/10 text-primary"
                    )}>
                      <span className="text-lg leading-none">{format(slot.dueDate, "dd")}</span>
                      <span className="text-[0.5rem] uppercase opacity-60">{format(slot.dueDate, "MMM")}</span>
                    </div>
                    <div>
                      <p className="font-bold uppercase italic text-sm text-foreground/80">{format(slot.dueDate, "EEEE, yyyy")}</p>
                      <p className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                        {slot.status === 'unpaid' ? "MISSING PAYMENT" : 
                         slot.status === 'paid-late' ? `RECONCILED ON ${format(parseISO(slot.actualPaymentDate!), "dd MMM")}` :
                         "SUCCESSFUL"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                        "font-black text-base leading-none tracking-tight",
                        slot.status === 'unpaid' ? "text-red-600" : "text-foreground"
                    )}>
                        TZS {rider.dailyFee.toLocaleString()}
                    </p>
                    {slot.status === 'unpaid' && (
                        <p className="text-[0.55rem] font-black uppercase mt-1 text-red-400 tracking-tighter">Required Now</p>
                    )}
                    {slot.status === 'paid-on-time' && (
                        <p className="text-[0.55rem] font-black uppercase mt-1 text-primary/60 tracking-tighter">Verified</p>
                    )}
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
