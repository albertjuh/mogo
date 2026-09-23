"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/supabase/auth/use-user";
import { useRow } from "@/supabase/use-row";
import { riderFromRow, type RiderRow } from "@/supabase/mappers";
import { initiatePayment } from "@/app/actions/payments";
import { MOBILE_PROVIDERS, detectProvider, normaliseTzPhone, providerLabel, type MobileProvider } from "@/lib/payment-providers";
import { cn } from "@/lib/utils";
import { Loader2, Smartphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function LipaPage() {
  const [amount, setAmount] = useState("10000");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<MobileProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: rider } = useRow<RiderRow, ReturnType<typeof riderFromRow>>(
    user?.role === 'rider' ? "riders" : null,
    user?.id,
    riderFromRow,
    "*",
    "profile_id"
  );

  // Pre-fill the rider's registered number once, and guess their network from it.
  useEffect(() => {
    if (rider?.phone && !phone) {
      setPhone(rider.phone);
      setProvider((p) => p ?? detectProvider(rider.phone));
    }
  }, [rider, phone]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const detected = detectProvider(value);
    if (detected) setProvider(detected);
  };

  const handleLipa = async () => {
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum < 500) {
      toast({ variant: "destructive", title: t("lipa.invalidAmountTitle"), description: t("lipa.invalidAmountDescription") });
      return;
    }
    if (!normaliseTzPhone(phone)) {
      toast({ variant: "destructive", title: t("lipa.invalidPhoneTitle"), description: t("lipa.invalidPhoneDescription") });
      return;
    }
    if (!provider) {
      toast({ variant: "destructive", title: t("lipa.chooseNetworkTitle"), description: t("lipa.chooseNetworkDescription") });
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await initiatePayment(amountNum, provider, phone);

      if (result.success) {
        setIsSuccess(true);
        toast({ title: t("lipa.requestSentTitle"), description: t("lipa.requestSentDescription") });
      } else {
        toast({ variant: "destructive", title: t("lipa.paymentFailedTitle"), description: result.error });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-500">
            <CheckCircle2 size={80} className="text-primary mb-6" />
            <h2 className="text-3xl font-black mb-2">{t("lipa.successTitle")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("lipa.successDescription", { provider: providerLabel(provider ?? undefined) })}
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">{t("lipa.payAnotherAmount")}</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">{t("lipa.title")}</h1>
        <p className="text-muted-foreground">{t("lipa.subtitle")}</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className="bg-gold p-2 rounded-lg">
                    <Smartphone className="text-accent" />
                </div>
                <div>
                    <CardTitle className="text-lg">{t("lipa.cardTitle")}</CardTitle>
                    <CardDescription className="text-white/60">{t("lipa.cardDescription")}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t("lipa.amountLabel")}</Label>
            <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-black h-14 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t("lipa.phoneLabel")}</Label>
            <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0754 123 456"
                className="h-12 font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t("lipa.networkLabel")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-colors",
                    provider === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  )}
                >
                  <p className="font-black text-sm">{p.label}</p>
                  <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground font-bold">{p.network}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleLipa} disabled={isLoading} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : (provider ? t("lipa.payButtonWithProvider", { provider: providerLabel(provider) }) : t("lipa.payButton"))}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[0.65rem] text-muted-foreground font-bold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("lipa.pinNotice")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
