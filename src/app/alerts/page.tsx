"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialPayments } from "@/lib/data";
import type { Rider, Payment, Alert as AlertType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CalendarClock } from "lucide-react";
import { differenceInDays, isBefore, parseISO, format } from "date-fns";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AlertsPage() {
  const { t } = useLanguage();
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
          message: t("alerts.message.contract", { name: rider.name, days: daysUntilExpiry, date: format(contractEndDate, 'PPP') }),
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
                message: t("alerts.message.payment", { name: rider.name, date: lastPayment ? format(parseISO(lastPayment.recordedAt), 'PPP') : t("alerts.message.never") }),
                date: new Date().toISOString(),
                riderId: rider.id,
            });
        }
    });

    setAlerts(generatedAlerts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
  }, [riders, payments, t]);


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">{t("alerts.title")}</h1>
        <p className="text-muted-foreground">{t("alerts.subtitle")}</p>
      </header>

      {alerts.length > 0 ? (
        <div className="space-y-4">
            {alerts.map(alert => (
                 <Alert key={alert.id} variant={alert.type === 'payment' ? 'destructive' : 'default'}>
                    {alert.type === 'payment' ? <AlertCircle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                    <AlertTitle>{alert.type === 'payment' ? t("alerts.type.payment") : t("alerts.type.contract")}</AlertTitle>
                    <AlertDescription>
                        {alert.message}
                    </AlertDescription>
                </Alert>
            ))}
        </div>
      ) : (
         <Card className="text-center py-12 border-dashed">
            <CardHeader>
                <CardTitle className="font-headline">{t("alerts.empty.title")}</CardTitle>
                <p className="text-muted-foreground">{t("alerts.empty.description")}</p>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
