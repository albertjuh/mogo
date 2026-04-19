
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
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
          "border-none shadow-xl transition-all duration-500",
          hasDebt ? "bg-red-50 ring-1 ring-red-200" : isOverpaid ? "bg-green-50 ring-1 ring-primary/20" : ""
        )}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-black text-2xl italic uppercase flex items-center gap-2">
                  {rider.name}
                  {hasDebt && <AlertCircle className="text-red-600 h-5 w-5" />}
                  {isOverpaid && <TrendingUp className="text-primary h-5 w-5" />}
                </CardTitle>
                <CardDescription className="font-bold text-xs">
                  {rider.plateNumber} • {rider.paymentFrequency} Plan (TZS {rider.dailyFee.toLocaleString()})
                </CardDescription>
              </div>
              <div className="text-right">
                {hasDebt ? (
                   <Badge variant="destructive" className="font-black px-4 py-1 text-sm">
                     ARREARS DETECTED
                   </Badge>
                ) : isOverpaid ? (
                   <Badge className="bg-primary font-black px-4 py-1 text-sm text-white">
                     ADVANCE PAYMENT
                   </Badge>
                ) : (
                   <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 text-sm">
                     IN GOOD STANDING
                   </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isOverpaid && (
              <div className="mb-4 p-3 bg-primary/10 rounded-xl border-2 border-primary border-dashed text-center">
                <p className="font-black text-primary italic text-sm uppercase tracking-wider">
                  + TZS {totalPaidRemaining.toLocaleString()} ACCOUNT CREDIT
                </p>
              </div>
            )}
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {slots.map((slot, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    slot.status === 'unpaid' && "bg-red-100 border-red-200 text-red-900 shadow-sm",
                    slot.status === 'paid-on-time' && "bg-white border-primary/10",
                    slot.status === 'paid-late' && "bg-amber-50 border-amber-200 text-amber-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-black",
                      slot.status === 'unpaid' ? "bg-red-200 text-red-700" : "bg-secondary text-muted-foreground"
                    )}>
                      {format(slot.dueDate, "dd")}
                    </div>
                    <div>
                      <p className="font-black uppercase italic leading-none text-sm">{format(slot.dueDate, "MMMM yyyy")}</p>
                      <p className="text-[0.6rem] font-bold opacity-70 uppercase tracking-widest mt-1">
                        {slot.status === 'unpaid' ? "PAYMENT MISSING" : 
                         slot.status === 'paid-late' ? `RECONCILED ON ${format(parseISO(slot.actualPaymentDate!), "dd MMM")}` :
                         "ON-TIME PAYMENT"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-base leading-none">TZS {rider.dailyFee.toLocaleString()}</p>
                    {slot.status === 'unpaid' && <p className="text-[0.5rem] font-bold uppercase mt-1 text-red-600">Pending Action</p>}
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
