"use client";

import { initialSavings } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Award, Banknote, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function SavingsPage() {
  const { t } = useLanguage();
  const savings = initialSavings;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">{t("savings.title")}</h1>
        <p className="text-muted-foreground">{t("savings.subtitle")}</p>
      </header>

      <Card className="bg-primary text-primary-foreground border-none shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 opacity-10">
            <TrendingUp size={150} />
        </div>
        <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">{t("savings.totalSaved")}</CardTitle>
            <div className="text-5xl font-black">{t("savings.totalSaved.amount", { amount: savings.totalSavingsToDate.toLocaleString() })}</div>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-medium">{t("savings.totalSaved.description")}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">{t("savings.comparison.title")}</h3>
        <Card className="border-none shadow-md">
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-bold uppercase text-muted-foreground">{t("savings.comparison.ourRate")}</p>
                        <p className="text-3xl font-black text-primary">{(savings.ourInterestRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="h-12 w-px bg-border"></div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs font-bold uppercase text-muted-foreground">{t("savings.comparison.otherRate")}</p>
                        <p className="text-3xl font-black text-muted-foreground">{(savings.competitorInterestRate * 100).toFixed(0)}%</p>
                    </div>
                </div>

                <div className="bg-secondary p-4 rounded-xl flex gap-4 items-center">
                    <Banknote className="text-primary shrink-0" />
                    <div>
                        <p className="font-bold">{t("savings.monthlyBenefit.title")}</p>
                        <p className="text-sm text-muted-foreground">{t("savings.monthlyBenefit.description", { amount: savings.monthlySavings.toLocaleString() })}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-accent text-accent-foreground border-none">
        <CardContent className="p-6 flex gap-4">
            <Award className="h-10 w-10 text-primary shrink-0" />
            <div className="space-y-1">
                <h4 className="font-bold">{t("savings.loyalty.title")}</h4>
                <p className="text-xs opacity-80">{t("savings.loyalty.description")}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
