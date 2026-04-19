"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans } from "@/lib/data";
import type { Loan } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Calendar, ArrowUpRight, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  
  const activeLoan = useMemo(() => loans.find(l => l.loanStatus === "Active"), [loans]);

  if (!activeLoan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <ShieldCheck size={64} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Active Loans</h2>
        <p className="text-muted-foreground">Apply for a new loan to see your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight font-headline">Habari, {user?.email.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Your Mogo Loan Summary</p>
      </header>

      <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={120} />
        </div>
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Outstanding Balance</CardTitle>
          <div className="text-4xl font-black">TZS {activeLoan.outstandingBalance.toLocaleString()}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
              <span>Loan Progress</span>
              <span>{activeLoan.progressPercentage}%</span>
            </div>
            <Progress value={activeLoan.progressPercentage} className="bg-black/20 h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-black/5 p-3 rounded-lg">
                <p className="text-[0.65rem] uppercase font-bold opacity-70">Total Paid</p>
                <p className="font-bold">TZS {activeLoan.totalAmountPaid.toLocaleString()}</p>
            </div>
            <div className="bg-black/5 p-3 rounded-lg">
                <p className="text-[0.65rem] uppercase font-bold opacity-70">Goal</p>
                <p className="font-bold">TZS {activeLoan.principalAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-md bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Calendar className="text-primary h-6 w-6" />
                <div>
                    <p className="text-[0.65rem] uppercase font-bold text-muted-foreground leading-none mb-1">Next Payment</p>
                    <p className="text-sm font-bold">{format(parseISO(activeLoan.nextPaymentDueDate), "dd MMM")}</p>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Wallet className="text-primary h-6 w-6" />
                <div>
                    <p className="text-[0.65rem] uppercase font-bold text-muted-foreground leading-none mb-1">Min Amount</p>
                    <p className="text-sm font-bold">TZS {activeLoan.minimumPaymentAmount.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <Button asChild className="w-full h-14 text-lg font-bold shadow-lg" size="lg">
        <Link href="/lipa" className="flex items-center justify-center gap-2">
            Lipa Sasa na M-Pesa <ArrowUpRight />
        </Link>
      </Button>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Quick Access</h3>
        <div className="grid grid-cols-3 gap-3">
             <Link href="/vault" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                <ShieldCheck className="text-primary" />
                <span className="text-[0.65rem] font-bold uppercase">Vault</span>
            </Link>
            <Link href="/savings" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                <ArrowUpRight className="text-primary" />
                <span className="text-[0.65rem] font-bold uppercase">Savings</span>
            </Link>
             <Link href="/contact" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                <Calendar className="text-primary" />
                <span className="text-[0.65rem] font-bold uppercase">Support</span>
            </Link>
        </div>
      </div>
    </div>
  );
}
