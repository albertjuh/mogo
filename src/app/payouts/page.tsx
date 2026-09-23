"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/supabase/auth/use-user";
import { useTable, type TableQuery } from "@/supabase/use-table";
import { payoutFromRow, type PayoutRow } from "@/supabase/mappers";
import { format, parseISO } from "date-fns";
import { lookupRecipient, initiatePayout } from "@/app/actions/payouts";
import { MOBILE_PROVIDERS, detectProvider, providerLabel, type MobileProvider } from "@/lib/payment-providers";
import { cn } from "@/lib/utils";
import { Loader2, Send, Banknote, ReceiptText, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PayoutsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [narration, setNarration] = useState("");
  const [provider, setProvider] = useState<MobileProvider | null>(null);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const payoutsQuery: TableQuery | null = user && user.role === "admin"
    ? { table: "payouts", order: { column: "recorded_at", ascending: false } }
    : null;
  const { data: payouts } = useTable<PayoutRow, ReturnType<typeof payoutFromRow>>(payoutsQuery, payoutFromRow);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setVerifiedName(null);
    const detected = detectProvider(value);
    if (detected) setProvider(detected);
  };

  const handleVerify = async () => {
    const amountNum = Number(amount);
    if (!user || !amount || isNaN(amountNum) || amountNum < 5000) {
      toast({ variant: "destructive", title: t("payouts.invalidAmountTitle"), description: t("payouts.invalidAmountDescription") });
      return;
    }
    if (!provider) {
      toast({ variant: "destructive", title: t("payouts.chooseNetworkTitle"), description: t("payouts.chooseNetworkDescription") });
      return;
    }

    setIsVerifying(true);
    setVerifiedName(null);
    try {
      const result = await lookupRecipient(phoneNumber, provider);
      if (result.success && result.name) {
        setVerifiedName(result.name);
        if (!recipientName) setRecipientName(result.name);
      } else {
        toast({ variant: "destructive", title: t("payouts.verifyFailedTitle"), description: result.error });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSend = async () => {
    if (!user || !provider) return;
    const amountNum = Number(amount);

    setIsSending(true);
    try {
      const result = await initiatePayout(amountNum, phoneNumber, provider, recipientName, narration || undefined);

      if (result.success) {
        toast({ title: t("payouts.sentTitle"), description: t("payouts.sentDescription", { reference: result.reference ?? "" }) });
        setAmount("");
        setPhoneNumber("");
        setRecipientName("");
        setNarration("");
        setProvider(null);
        setVerifiedName(null);
      } else {
        toast({ variant: "destructive", title: t("payouts.failedTitle"), description: result.error });
      }
    } finally {
      setIsSending(false);
    }
  };

  if (user?.role !== "admin") {
    return <div className="p-12 text-center font-bold">Access Denied: Strategic Admin Only</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter">{t("payouts.title")}</h1>
        <p className="text-muted-foreground">{t("payouts.subtitle")}</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Banknote className="text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("payouts.cardTitle")}</CardTitle>
              <CardDescription className="text-white/60">{t("payouts.cardDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              {t("payouts.amountLabel")}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              className="text-2xl font-black h-14 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              {t("payouts.phoneLabel")}
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0712345678"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              {t("payouts.networkLabel")}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOBILE_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id);
                    setVerifiedName(null);
                  }}
                  className={cn(
                    "rounded-lg border-2 px-3 py-2 text-left text-sm font-bold transition-colors",
                    provider === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              {t("payouts.nameLabel")}
            </Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Juma Hassan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="narration" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              {t("payouts.narrationLabel")}
            </Label>
            <Input
              id="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Weekly earnings withdrawal"
            />
          </div>

          {verifiedName && (
            <div className="bg-secondary/30 p-4 rounded-xl border border-dashed space-y-1 text-sm">
              <div className="flex items-center gap-2 font-bold text-primary">
                <BadgeCheck className="h-4 w-4" /> {t("payouts.registeredTo", { name: verifiedName ?? "" })}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("payouts.sending")}</span>
                <span className="font-black">
                  TZS {Number(amount).toLocaleString()} via {providerLabel(provider ?? undefined)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={isVerifying || isSending || !phoneNumber}
              className="flex-1 h-12 font-bold"
            >
              {isVerifying ? <Loader2 className="animate-spin" /> : t("payouts.verifyButton")}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !verifiedName || !provider || !recipientName}
              className="flex-1 h-12 font-bold shadow-lg shadow-primary/20"
            >
              {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              {t("payouts.sendButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-black uppercase tracking-tight">{t("payouts.recentTitle")}</h2>
        {payouts?.map((payout) => (
          <Card key={payout.id} className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{payout.recipientName}</p>
                <p className="text-[0.65rem] text-muted-foreground font-bold tracking-widest uppercase">
                  {payout.phoneNumber}{payout.provider ? ` • ${providerLabel(payout.provider)}` : ""} • {format(parseISO(payout.recordedAt), "dd MMM, HH:mm")}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-black text-accent">TZS {payout.amount.toLocaleString()}</p>
                <Badge variant="outline" className="text-[0.55rem] font-black uppercase">
                  {payout.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {payouts?.length === 0 && (
          <div className="text-center py-16 bg-secondary/20 rounded-3xl border-2 border-dashed">
            <ReceiptText className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("payouts.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
