
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Calendar, ArrowUpRight, ShieldCheck, TrendingUp, DollarSign, UserPlus, CheckCircle, AlertCircle, Loader2, Target, BarChart3 } from "lucide-react";
import { format, parseISO, isSameDay, subDays, isAfter, startOfDay, differenceInDays, startOfWeek } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { computeRiderBalance, periodDays } from "@/lib/balance";

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  // --- Role-Aware Data Fetching ---
  const isManager = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'recruiter';

  const ridersQuery = useMemoFirebase(() => {
    if (!user || !isManager) return null;
    return collection(db, "riders");
  }, [db, user, isManager]);
  const { data: riders } = useCollection(ridersQuery);

  const paymentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    if (user.role === 'rider') {
      // Isolation: Only fetch payments belonging to this specific Rider UID
      return query(collection(db, "payments"), where("riderId", "==", user.id));
    }
    return collection(db, "payments");
  }, [db, user]);
  const { data: allPayments } = useCollection(paymentsQuery);

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    if (!allPayments) return null;
    
    // Rider specific stats
    if (user?.role === 'rider') {
      const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return { totalPaid };
    }

    // Manager specific stats
    if (!riders) return null;
    
    const activeRidersList = riders.filter(r => r.active);
    const activeRidersCount = activeRidersList.length;
    const today = new Date();
    
    // Daily Stats
    const todayPayments = allPayments.filter(p => isSameDay(parseISO(p.recordedAt || p.date), today));
    const collectedToday = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    // Prorate each rider's contracted fee to a daily-equivalent rate (handles Weekly/10-Day terms).
    const dailyTarget = activeRidersList.reduce((sum, r) => sum + (r.dailyFee || 0) / periodDays(r.paymentFrequency), 0);
    
    // Weekly Stats
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const weekPayments = allPayments.filter(p => isAfter(parseISO(p.recordedAt || p.date), startOfCurrentWeek));
    const collectedThisWeek = weekPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const weeklyTarget = dailyTarget * 7;
    const weeklyProgress = weeklyTarget > 0 ? (collectedThisWeek / weeklyTarget) * 100 : 0;

    const paidTodayUids = new Set(todayPayments.map(p => p.riderId));
    const arrearsCount = activeRidersList.filter(r => !paidTodayUids.has(r.id)).length;

    const totalCollected = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const sevenDaysAgo = subDays(today, 7);
    const recruitedThisWeek = riders.filter(r => isAfter(parseISO(r.createdAt), sevenDaysAgo)).length;

    // Fleet-wide debt/overdraft: how much riders owe vs. how much they've paid ahead.
    const paymentsByRider = new Map<string, typeof allPayments>();
    allPayments.forEach(p => {
      const list = paymentsByRider.get(p.riderId) || [];
      list.push(p);
      paymentsByRider.set(p.riderId, list);
    });
    let totalDebt = 0;
    let totalCredit = 0;
    activeRidersList.forEach(r => {
      const { balance } = computeRiderBalance(r, paymentsByRider.get(r.id) || []);
      if (balance < 0) totalDebt += -balance;
      else totalCredit += balance;
    });

    return {
        collectedToday,
        dailyTarget,
        activeRiders: activeRidersCount,
        collectedThisWeek,
        weeklyTarget,
        weeklyProgress,
        arrearsCount,
        totalCollected,
        recruitedThisWeek,
        totalDebt,
        totalCredit
    };
  }, [allPayments, riders, user]);

  if (!user) return null;

  // --- RECRUITER DASHBOARD ---
  if (user.role === 'recruiter') {
      return (
          <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight font-headline italic uppercase">Recruitment Center</h1>
                <p className="text-muted-foreground">Growing the King Bariki Bajaji fleet, one driver at a time.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <UserPlus size={100} />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Riders Recruited (Last 7 Days)</CardTitle>
                        <div className="text-4xl font-black italic">{stats?.recruitedThisWeek || 0} New Drivers</div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm font-medium opacity-90">Great job! You are expanding the King Bariki fleet.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Button asChild className="h-20 text-lg font-bold shadow-lg bg-accent hover:bg-accent/90">
                        <Link href="/onboard" className="flex items-center gap-3">
                            <UserPlus className="h-6 w-6" /> Onboard New Driver
                        </Link>
                    </Button>
                </div>
            </div>
          </div>
      )
  }

  // --- RIDER DASHBOARD ---
  if (user.role === 'rider') {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight font-headline">Habari, {user.name || user.email.split('@')[0]}!</h1>
          <p className="text-muted-foreground">Muhtasari wa Mkopo wako wa Bajaji</p>
        </header>

        <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Jumla ya Malipo</CardTitle>
            <div className="text-4xl font-black italic">TZS {(stats?.totalPaid || 0).toLocaleString()}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium opacity-90">Asante kwa kulipa kwa wakati. Endelea kukuza historia yako ya mkopo.</p>
          </CardContent>
        </Card>

        <Button asChild className="w-full h-14 text-lg font-bold shadow-lg" size="lg">
          <Link href="/lipa" className="flex items-center justify-center gap-2">
              Lipa Sasa kwa Simu <ArrowUpRight />
          </Link>
        </Button>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Huduma za Haraka</h3>
          <div className="grid grid-cols-3 gap-3">
               <Link href="/vault" className="flex flex-col items-center p-3 bg-secondary rounded-xl gap-2 hover:bg-primary/10 transition-colors">
                  <ShieldCheck className="text-primary" />
                  <span className="text-[0.65rem] font-bold uppercase">Nyaraka</span>
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
  const isSupervisor = user.role === 'supervisor';

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight font-headline uppercase italic">
          {user.role === 'admin' ? 'Strategic Command' : 'Ground Operations'}
        </h1>
        <p className="text-muted-foreground">
          {isSupervisor ? 'Analyzing driver activity and daily collection targets.' : 'Business operations and high-level trends.'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-accent text-white border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-70 flex items-center gap-2">
              <DollarSign size={14} /> Collected Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black italic">TZS {(stats?.collectedToday || 0).toLocaleString()}</div>
            <p className="text-[0.65rem] font-bold text-white/50 uppercase mt-2 tracking-widest">
                Target: TZS {(stats?.dailyTarget || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <BarChart3 size={14} /> Weekly Target Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="text-2xl font-black italic text-primary">{(stats?.weeklyProgress || 0).toFixed(0)}%</div>
                <div className="text-[0.65rem] font-bold text-muted-foreground">
                    TZS {(stats?.collectedThisWeek || 0).toLocaleString()} / {(stats?.weeklyTarget || 0).toLocaleString()}
                </div>
            </div>
            <Progress value={stats?.weeklyProgress || 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border-none shadow-md">
            <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">Active Fleet</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-xl font-black text-accent">{stats?.activeRiders || 0} Riders</div>
            </CardContent>
        </Card>
        
        {!isSupervisor && (
           <Card className="bg-white border-none shadow-md">
            <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-xl font-black text-primary">TZS {(stats?.totalCollected || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {(stats?.totalDebt ?? 0) > 0 && (
        <Card className="border-none shadow-md bg-orange-50 ring-1 ring-orange-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-orange-900">TZS {(stats?.totalDebt ?? 0).toLocaleString()} in Fleet Debt</p>
              <p className="text-xs text-orange-700/80">Total owed across all active riders vs. their contracts.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-bold uppercase text-[0.65rem] tracking-widest">
              <Link href="/fleet" className="flex items-center gap-1">
                View Fleet <ArrowUpRight size={14} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {(stats?.arrearsCount ?? 0) > 0 && (
        <Card className="border-none shadow-md bg-red-50 ring-1 ring-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold text-red-900">{stats?.arrearsCount} Riders with Arrears</p>
                <p className="text-xs text-red-700/80">Riders who have not paid today's fee.</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700 font-bold uppercase text-[0.65rem] tracking-widest">
              <Link href="/alerts" className="flex items-center gap-1">
                Follow Up <ArrowUpRight size={14} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-20 flex flex-col gap-1 border-primary/20 hover:bg-primary/5 shadow-sm">
          <Link href="/onboard">
            <UserPlus className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase">Onboard New</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex flex-col gap-1 border-primary/20 hover:bg-primary/5 shadow-sm">
          <Link href="/collect">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase">Verify Payments</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
