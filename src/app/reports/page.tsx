"use client";

import { useState, useMemo, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { reportInsightsGenerator, ReportInsightsGeneratorOutput } from "@/ai/flows/report-insights-generator-flow";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialPayments } from "@/lib/data";
import type { Payment } from "@/lib/types";
import { eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              TZS {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export default function ReportsPage() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<ReportInsightsGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [payments] = useLocalStorage<Payment[]>("payments", initialPayments);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const weeklyData = useMemo(() => {
    if (!clientNow) {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end }).map(day => ({ name: format(day, 'E'), total: 0 }));
    };
    const today = clientNow;
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start, end });

    const data = weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const total = payments
        .filter(p => format(parseISO(p.date), 'yyyy-MM-dd') === dayStr)
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        name: format(day, 'E'),
        total: total,
      };
    });

    return data;
  }, [payments, clientNow]);
  

  const totalRevenue = weeklyData.reduce((acc, curr) => acc + curr.total, 0);

  const generateInsights = async () => {
    setIsLoading(true);
    setInsights(null);
    try {
      const financialReport = `Total weekly revenue: TZS ${totalRevenue.toLocaleString()}. Daily collections: ${weeklyData.map(d => `${d.name}: ${d.total}`).join(', ')}.`;
      const operationalReport = `Fleet consists of multiple riders. Payments are being tracked daily.`;
      
      const result = await reportInsightsGenerator({ financialReport, operationalReport });
      setInsights(result);

    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate insights. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isChartLoading = !clientNow;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Reports</h1>
        <p className="text-muted-foreground">Analyze your business performance.</p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Weekly Revenue</CardTitle>
          <CardDescription>Total for this week: TZS {totalRevenue.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            {isChartLoading ? <Skeleton className="w-full h-[300px]" /> :
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `TZS ${value / 1000}k`} />
               <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline">AI-Powered Insights</CardTitle>
            <Button onClick={generateInsights} disabled={isLoading} size="sm">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
          <CardDescription>Get a summary and recommendations from our AI.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          )}
          {insights && (
            <div className="space-y-4 text-sm animate-in fade-in-50 duration-500">
                <p className="italic text-muted-foreground">{insights.summary}</p>
                <div>
                    <h4 className="font-semibold mb-2">Key Insights:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                        {insights.keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                        {insights.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
            </div>
          )}
          {!isLoading && !insights && (
            <p className="text-muted-foreground text-center py-6">Click "Generate" to get your report analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
