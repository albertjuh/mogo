
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { checkPaymentStatus } from "@/app/actions/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Ghost, Flame, ReceiptText, CheckCircle2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { providerLabel } from "@/lib/payment-providers";

export default function PaymentsPage() {
  const { user, firebaseUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  // Fetch all payments for admins, or just my payments for riders
  const paymentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    if (user.role === 'admin' || user.role === 'supervisor') {
      return query(collection(db, "payments"), orderBy("recordedAt", "desc"));
    }
    return query(collection(db, "payments"), where("riderId", "==", user.id), orderBy("recordedAt", "desc"));
  }, [db, user]);

  const { data: payments, isLoading } = useCollection(paymentsQuery);

  const ridersQuery = useMemoFirebase(() => collection(db, "riders"), [db]);
  const { data: riders } = useCollection(ridersQuery);

  const handleReSync = async (gatewayRef: string) => {
    if (!firebaseUser) return;

    toast({
      title: "Re-syncing with AzamPay...",
      description: `Checking status for Ref: ${gatewayRef}`,
    });

    const idToken = await firebaseUser.getIdToken();
    const result = await checkPaymentStatus(idToken, gatewayRef);

    if (result.success) {
      toast({
        title: "Synchronization Complete",
        description: `Status: ${result.status}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: result.error,
      });
    }
  };

  const getRiderName = (riderId: string) => {
    return riders?.find(r => r.id === riderId)?.name || "Unknown Rider";
  };

  if (!clientNow || isLoading) return null;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter">Payments Ledger</h1>
          <p className="text-muted-foreground font-medium">Verified AzamPay audit trail.</p>
        </div>
      </header>

      <div className="space-y-4">
        {payments?.map((payment) => (
          <Card key={payment.id} className="border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-4 hover:bg-muted/5 transition-colors">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  payment.status === 'pending' ? "bg-yellow-50 text-yellow-600" : "bg-primary/10 text-primary"
                )}>
                  {payment.status === 'pending' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xs uppercase tracking-tight truncate text-accent">
                      {user?.role !== 'rider' ? getRiderName(payment.riderId) : "Installment Payment"}
                    </h3>
                    <Badge variant="outline" className="text-[0.5rem] px-1 h-3.5 uppercase font-black">
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-[0.6rem] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">
                    {payment.provider ? `${providerLabel(payment.provider)} • ` : ""}Ref: {payment.gatewayRef} • {format(parseISO(payment.recordedAt), "dd MMM, HH:mm")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-sm tabular-nums text-accent">
                      TZS {payment.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  {(user?.role === 'admin' || user?.role === 'supervisor') && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleReSync(payment.gatewayRef)}
                    >
                      <RefreshCcw size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {payments?.length === 0 && (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed">
            <ReceiptText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
