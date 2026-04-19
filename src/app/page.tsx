
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialLoans, initialPayments, initialRiders } from "@/lib/data";
import type { Loan, Payment, Rider } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Calendar, ArrowUpRight, ShieldCheck, Users, TrendingUp, DollarSign } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const [loans] = useLocalStorage<Loan[]>("loans", initialLoans);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [riders] = useLocalStorage<Rider[]>("riders", initialRiders);

  // --- Rider (Client) View Logic ---
  const myLoan = useMemo(() => {
    if (user?.role !== 'rider') return null;
    return loans.find(l => l.clientId === user.id && l.loanStatus === "Active");
  }, [loans, user]);

  // --- Admin/Supervisor View Logic ---
  const stats = useMemo(() => {
    if (user?.role === 'rider') return null;
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const activeRiders = riders.filter(r => r.active).length;
    const todayPayments = payments.filter(p => isSameDay(parseISO(p.date), new Date()));
    const collectedToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return { totalCollected, activeRiders, collectedToday };
  }, [payments, riders, user]);

  if (!user) return null;

  // --- RIDER DASHBOARD ---
  if (user.role === 'rider') {
    if (!myLoan) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <ShieldCheck size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Huna Mkopo Amilifu</h2>
          <p className="text-muted-foreground">Wasiliana na Mogo ili kuanza safari yako ya umiliki leo.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight font-headline">Habari, {user.email.split('@')[0]}!</h1>
          <p className="text-muted-foreground">Muhtasari wa Mkopo wako wa Mogo</p>
        </header>

        <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Salio Linalosubiri</CardTitle>
            <div className="text-4xl font-black italic">TZS {myLoan.outstandingBalance.toLocaleString()}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span>Maendeleo ya Mkopo</span>
                <span>{myLoan.progressPercentage}%</span>
              </div>
              <Progress value={myLoan.progressPercentage} className="bg-white/20 h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-md bg-white">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <Calendar className="text-primary h-6 w-6" />
                  <div>
                      <p className="text-[0.65rem] uppercase font-bold text-muted-foreground leading-none mb-1">Malipo Yajayo</p>
                      <p className="text-sm font-bold">{format(parseISO(myLoan.nextPaymentDueDate), "dd MMM")}</p>
                  </div>
              </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <Wallet className="text-primary h-6 w-6" />
                  <div>
                      <p className="text-[0.65rem] uppercase font-bold text-muted-foreground leading-none mb-1">Kiwango kidogo</p>
                      <p className="text-sm font-bold">TZS {myLoan.minimumPaymentAmount.toLocaleString()}</p>
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
          <h3 className="font-bold text-lg">Huduma za Haraka</h3>
          <div className="grid grid-cols-3 gap-3">
               <Link href="/vault" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                  <ShieldCheck className="text-primary" />
                  <span className="text-[0.65rem] font-bold uppercase">Nyaraka</span>
              </Link>
              <Link href="/savings" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                  <TrendingUp className="text-primary" />
                  <span className="text-[0.65rem] font-bold uppercase">Faida</span>
              </Link>
               <Link href="/payments" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                  <Calendar className="text-primary" />
                  <span className="text-[0.65rem] font-bold uppercase">Historia</span>
              </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN / SUPERVISOR DASHBOARD ---
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight font-headline uppercase italic">
          {user.role === 'admin' ? 'Admin Panel' : 'Supervisor Overview'}
        </h1>
        <p className="text-muted-foreground">Hali ya biashara na mienendo ya leo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-accent text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70 flex items-center gap-2">
              <DollarSign size={14} /> Leo Imekusanywa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">TZS {stats?.collectedToday.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users size={14} /> Fleet Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary italic">{stats?.activeRiders} Riders</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp size={14} /> Makusanyo Jumla
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">TZS {stats?.totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-20 flex flex-col gap-1 border-primary/20 hover:bg-primary/5">
          <Link href="/collect">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase">Daily Collection</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-1 border-primary/20 hover:bg-primary/5">
          <Link href="/fleet">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase">Manage Fleet</span>
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">System Insights</h3>
        <Card className="border-none shadow-sm bg-secondary/50">
          <CardContent className="p-4 flex items-start gap-4">
            <TrendingUp className="text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Ufanisi wa Ulipaji</p>
              <p className="text-xs text-muted-foreground mt-1">
                Makusanyo ya leo yamefikia 85% ya lengo la siku. Riders 3 bado hawajalipa.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-xs font-bold text-primary mt-2">
                <Link href="/reports">Angalia Ripoti Zaidi</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
