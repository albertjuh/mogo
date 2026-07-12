"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment, Alert as AlertType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CalendarClock } from "lucide-react";
import { differenceInDays, isBefore, parseISO, format } from "date-fns";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  useEffect(() => {
    const today = new Date();
    const generatedAlerts: AlertType[] = [];

    // Contract expiration alerts
    riders.forEach(rider => {
      if (!rider.active) return;
      const contractEndDate = parseISO(rider.contractEnd);
      const daysUntilExpiry = differenceInDays(contractEndDate, today);

      if (daysUntilExpiry <= 30 && isBefore(today, contractEndDate)) {
        generatedAlerts.push({
          id: `contract-${rider.id}`,
          type: 'contract',
          message: `${rider.name}'s contract is expiring in ${daysUntilExpiry} days on ${format(contractEndDate, 'PPP')}.`,
          date: new Date().toISOString(),
          riderId: rider.id,
        });
      }
    });

    // For missed payments, this is a simplification. A real app would check against expected payments.
    // Here, we'll just flag if a rider hasn't paid in the last 2 days.
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    riders.forEach(rider => {
        if (!rider.active) return;
        const lastPayment = payments
            .filter(p => p.riderId === rider.id)
            .sort((a,b) => parseISO(b.recordedAt).getTime() - parseISO(a.recordedAt).getTime())[0];

        if(!lastPayment || isBefore(parseISO(lastPayment.recordedAt), twoDaysAgo)) {
            generatedAlerts.push({
                id: `payment-${rider.id}`,
                type: 'payment',
                message: `${rider.name} may have a missed payment. Last payment was ${lastPayment ? format(parseISO(lastPayment.recordedAt), 'PPP') : 'never'}.`,
                date: new Date().toISOString(),
                riderId: rider.id,
            });
        }
    });
    
    setAlerts(generatedAlerts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
  }, [riders, payments]);


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Alerts</h1>
        <p className="text-muted-foreground">Stay on top of important events.</p>
      </header>

      {alerts.length > 0 ? (
        <div className="space-y-4">
            {alerts.map(alert => (
                 <Alert key={alert.id} variant={alert.type === 'payment' ? 'destructive' : 'default'}>
                    {alert.type === 'payment' ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                    <AlertTitle>{alert.type === 'payment' ? 'Potential Missed Payment' : 'Contract Expiration'}</AlertTitle>
                    <AlertDescription>
                        {alert.message}
                    </AlertDescription>
                </Alert>
            ))}
        </div>
      ) : (
         <Card className="text-center py-12 border-dashed">
            <CardHeader>
                <CardTitle className="font-headline">All Clear!</CardTitle>
                <p className="text-muted-foreground">No alerts right now. Everything looks good.</p>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
