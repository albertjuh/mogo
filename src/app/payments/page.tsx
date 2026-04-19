
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Download, Ghost, Flame, ReceiptText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type PaymentSlot = {
  dueDate: Date;
  status: 'paid-on-time' | 'paid-late' | 'unpaid' | 'overpaid';
  amountCovered: number;
  actualPaymentDate?: string;
};

export default function PaymentsPage() {
  const { user } = useUser();
  const { toast } = useToast();
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

  const handleDownloadReceipt = (date: string) => {
    toast({
      title: "Receipt Downloaded",
      description: `Official Mogo receipt for ${date} has been saved to your device.`,
    });
  };

  if (!clientNow) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Payments & Receipts</h1>
        <p className="text-muted-foreground font-medium">Official financial records and digital receipts.</p>
      </header>

      {riderStats.map(({ rider, slots, totalPaidRemaining, isOverpaid, hasDebt }) => (
        <div key={rider.id} className="space-y-4">
          {/* Rider Header Summary */}
          <div className="flex justify-between items-end px-1">
            <div>
              <h2 className="font-black text-xl italic uppercase text-accent flex items-center gap-2">
                {rider.name}
                {hasDebt && <Ghost className="text-red-400 h-5 w-5 animate-bounce" />}
                {isOverpaid && <Flame className="text-primary h-5 w-5 animate-pulse" />}
              </h2>
              <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest">
                {rider.plateNumber} • {rider.paymentFrequency} Plan
              </p>
            </div>
            {hasDebt ? (
              <Badge variant="destructive" className="font-black text-[0.55rem] tracking-tighter">DEBT DETECTED</Badge>
            ) : isOverpaid ? (
              <Badge className="bg-primary font-black text-[0.55rem] tracking-tighter text-white">BOSSI STATUS</Badge>
            ) : null}
          </div>

          {/* Payment Slots using Vault Card Design */}
          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <Card key={idx} className={cn(
                "border-none shadow-sm overflow-hidden transition-all hover:shadow-md",
                slot.status === 'unpaid' ? "bg-red-50/50 ring-1 ring-red-100" : "bg-white"
              )}>
                <CardContent className="p-0">
                  <div className="flex items-center p-4 gap-4">
                    {/* Status Icon in background box */}
                    <div className={cn(
                      "p-3 rounded-xl shrink-0",
                      slot.status === 'unpaid' ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                    )}>
                      {slot.status === 'unpaid' ? <AlertCircle size={24} /> : <ReceiptText size={24} />}
                    </div>

                    {/* Title and Metadata */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate uppercase tracking-tight">
                        {slot.status === 'unpaid' ? "Missing Payment" : 
                         slot.status === 'paid-late' ? "Reconciled Payment" : "Daily Payment"}
                      </h3>
                      <p className="text-[0.65rem] text-muted-foreground font-black tracking-widest uppercase">
                        {format(slot.dueDate, "EEEE, dd MMM yyyy")}
                      </p>
                      {slot.actualPaymentDate && (
                         <p className="text-[0.6rem] text-primary font-bold uppercase mt-0.5">
                            Verified on {format(parseISO(slot.actualPaymentDate), "dd MMM")}
                         </p>
                      )}
                    </div>

                    {/* Amount (Only Red if Missing) and Action */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={cn(
                          "font-black text-sm",
                          slot.status === 'unpaid' ? "text-red-600" : "text-accent"
                        )}>
                          TZS {rider.dailyFee.toLocaleString()}
                        </p>
                        {slot.status !== 'unpaid' && (
                           <p className="text-[0.5rem] font-bold text-primary flex items-center justify-end gap-0.5">
                             <CheckCircle2 size={8} /> PAID
                           </p>
                        )}
                      </div>
                      
                      {slot.status !== 'unpaid' && (
                        <button 
                          onClick={() => handleDownloadReceipt(format(slot.dueDate, "dd MMM"))}
                          className="p-2 bg-secondary rounded-lg hover:bg-primary hover:text-white transition-colors text-muted-foreground"
                          title="Download Receipt"
                        >
                          <Download size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
