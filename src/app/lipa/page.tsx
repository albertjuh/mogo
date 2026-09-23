"use client";

import { useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { initiatePayment } from "@/app/actions/payments";
import { MOBILE_PROVIDERS, detectProvider, normaliseTzPhone, providerLabel, type MobileProvider } from "@/lib/payment-providers";
import type { Rider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, Smartphone, CheckCircle2, ShieldCheck } from "lucide-react";

export default function LipaPage() {
  const [amount, setAmount] = useState("10000");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<MobileProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, firebaseUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const riderRef = useMemoFirebase(() => (user ? doc(db, "riders", user.id) : null), [db, user]);
  const { data: rider } = useDoc<Rider>(riderRef);

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
      toast({ variant: "destructive", title: "Kiasi si sahihi", description: "Kiwango cha chini ni TZS 500." });
      return;
    }
    if (!normaliseTzPhone(phone)) {
      toast({ variant: "destructive", title: "Namba si sahihi", description: "Weka namba sahihi ya simu, mfano 0754 123 456." });
      return;
    }
    if (!provider) {
      toast({ variant: "destructive", title: "Chagua mtandao", description: "Chagua njia ya malipo unayotumia." });
      return;
    }
    if (!firebaseUser) return;

    setIsLoading(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const result = await initiatePayment(idToken, amountNum, provider, phone);

      if (result.success) {
        setIsSuccess(true);
        toast({ title: "Ombi limetumwa", description: "Muamala unashughulikiwa." });
      } else {
        toast({ variant: "destructive", title: "Malipo hayakufanikiwa", description: result.error });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-500">
            <CheckCircle2 size={80} className="text-primary mb-6" />
            <h2 className="text-3xl font-black mb-2">Imetumwa!</h2>
            <p className="text-muted-foreground mb-8">
              Tafadhali angalia simu yako kwa ujumbe wa {providerLabel(provider ?? undefined)} na uweke PIN yako ili kukamilisha malipo.
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">Lipa Kiasi Kingine</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">Lipa King Bariki</h1>
        <p className="text-muted-foreground">Malipo salama ya simu kupitia AzamPay</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className="bg-gold p-2 rounded-lg">
                    <Smartphone className="text-accent" />
                </div>
                <div>
                    <CardTitle className="text-lg">Lipa kwa Simu</CardTitle>
                    <CardDescription className="text-white/60">M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Kiasi cha Kulipa (TZS)</Label>
            <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-black h-14 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Namba ya Simu ya Kulipia</Label>
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
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Njia ya Malipo</Label>
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
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : `Lipa${provider ? ` kwa ${providerLabel(provider)}` : ""}`}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[0.65rem] text-muted-foreground font-bold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Utaombwa kuweka PIN kwenye simu yako
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
