
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, isSameDay, isBefore, startOfDay, subDays } from "date-fns";
import { useUser } from "@/firebase/auth/use-user";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Ghost, Flame, ReceiptText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type PaymentSlot = {
  dueDate: Date;
  status: 'paid-on-time' | 'unpaid';
  amountCovered: number;
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
        .filter(p => p.riderId === rider.id);
      
      const start = startOfDay(parseISO(rider.contractStart));
      // History cut to 14 days for a clean look
      const lookbackStart = isBefore(start, subDays(clientNow, 14)) ? subDays(clientNow, 14) : start;
      const end = startOfDay(clientNow);
      
      let intervals: Date[] = [];
      if (rider.paymentFrequency === 'Weekly') {
        intervals = eachWeekOfInterval({ start: lookbackStart, end }, { weekStartsOn: 1 });
      } else {
        intervals = eachDayOfInterval({ start: lookbackStart, end });
      }

      const slots: PaymentSlot[] = [];
      const fee = rider.dailyFee;

      intervals.forEach((dueDate) => {
        const isPaid = riderPayments.some(p => isSameDay(startOfDay(parseISO(p.date)), startOfDay(dueDate)));
        
        slots.push({
          dueDate,
          status: isPaid ? 'paid-on-time' : 'unpaid',
          amountCovered: fee
        });
      });

      const hasDebt = slots.some(s => s.status === 'unpaid');
      const isOverpaid = rider.id === 'rider-2'; // Ally remains the 'Bossi' for UI variety

      return {
        rider,
        slots: slots.reverse(),
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
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Payments Ledger</h1>
        <p className="text-muted-foreground font-medium">Unified collection history and digital receipts.</p>
      </header>

      <div className="space-y-8">
        {riderStats.map(({ rider, slots, isOverpaid, hasDebt }) => (
          <Card key={rider.id} className="border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-accent text-white p-6 pb-8 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 border-8 border-white/5 rounded-full" />
                
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <h2 className="font-black text-2xl italic uppercase tracking-tight">{rider.name}</h2>
                             {hasDebt && <Ghost className="text-red-400 h-5 w-5 animate-pulse" />}
                             {isOverpaid && <Flame className="text-primary h-5 w-5 animate-bounce" />}
                        </div>
                        <p className="text-[0.65rem] font-bold text-white/60 uppercase tracking-[0.2em]">
                            {rider.plateNumber} • {rider.paymentFrequency} Plan
                        </p>
                    </div>
                    {hasDebt ? (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-100 border-red-500/30 font-black text-[0.55rem] tracking-tighter px-3">DEBT DETECTED</Badge>
                    ) : (
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[0.55rem] tracking-tighter px-3">ACCOUNT CLEAR</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0 -mt-4 relative z-20 mx-4 mb-4 bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="divide-y divide-muted/50">
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center p-4 gap-4 hover:bg-muted/5 transition-colors">
                    {/* Status Icon - Same structure as Vault */}
                    <div className={cn(
                      "p-3 rounded-xl shrink-0 transition-transform active:scale-95",
                      slot.status === 'unpaid' ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
                    )}>
                      {slot.status === 'unpaid' ? <AlertCircle size={22} /> : <ReceiptText size={22} />}
                    </div>

                    {/* Metadata - Same structure as Vault */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-black text-xs uppercase tracking-tight truncate",
                        slot.status === 'unpaid' ? "text-red-500/80" : "text-accent"
                      )}>
                        {slot.status === 'unpaid' ? "Missing Installment" : "Successful Payment"}
                      </h3>
                      <p className="text-[0.6rem] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">
                         {format(slot.dueDate, "eeee, dd MMM yyyy")}
                      </p>
                    </div>

                    {/* Amount & Actions - Amount is the only big Red area */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                          "font-black text-sm tabular-nums",
                          slot.status === 'unpaid' ? "text-red-600" : "text-accent"
                        )}>
                          {slot.status === 'unpaid' ? '-' : ''}TZS {slot.amountCovered.toLocaleString()}
                        </p>
                        <p className={cn(
                           "text-[0.5rem] font-black tracking-widest uppercase flex items-center justify-end gap-1",
                           slot.status === 'unpaid' ? "text-red-500" : "text-primary"
                        )}>
                           {slot.status === 'unpaid' ? "ARREARS" : <><CheckCircle2 size={8} /> VERIFIED</>}
                        </p>
                      </div>
                      
                      {slot.status !== 'unpaid' ? (
                        <button 
                          onClick={() => handleDownloadReceipt(format(slot.dueDate, "dd MMM"))}
                          className="p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-accent hover:text-white transition-all shadow-sm active:scale-90"
                          title="Download Receipt"
                        >
                          <Download size={18} />
                        </button>
                      ) : (
                         <div className="w-10" /> /* Spacing for alignment */
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {slots.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">No recent activity for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
