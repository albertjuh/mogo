"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments, initialRiders } from "@/lib/data";
import type { Payment, Rider } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

export default function PaymentsPage() {
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);

  const getRiderName = (riderId: string) => {
    return riders.find(r => r.id === riderId)?.name || "Unknown Rider";
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Payments</h1>
        <p className="text-muted-foreground">Track daily payments from your riders.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Payments</CardTitle>
          <CardDescription>A log of all payments collected from your fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{getRiderName(payment.riderId)}</TableCell>
                    <TableCell>{format(parseISO(payment.date), "PPP")}</TableCell>
                    <TableCell className="text-right">KES {payment.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No payments recorded yet.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
