
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { initiatePayment } from "@/app/actions/payments";
import { Loader2, Smartphone, CheckCircle2 } from "lucide-react";

export default function LipaPage() {
  const [amount, setAmount] = useState("10000");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { firebaseUser } = useUser();
  const { toast } = useToast();

  const handleLipa = async () => {
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum < 500) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Minimum payment is TZS 500." });
      return;
    }
    if (!firebaseUser) return;

    setIsLoading(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const result = await initiatePayment(idToken, amountNum);

      if (result.success) {
        setIsSuccess(true);
        toast({ title: "STK Push Sent", description: "Muamala unashughulikiwa." });
      } else {
        toast({ variant: "destructive", title: "Payment Failed", description: result.error });
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
            <p className="text-muted-foreground mb-8">Tafadhali angalia simu yako kwa ujumbe wa M-Pesa na uweke PIN yako ili kukamilisha malipo.</p>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">Lipa Kiasi Kingine</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">Lipa kwa Mogo</h1>
        <p className="text-muted-foreground">Malipo salama kupitia JWT & Snippe</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Smartphone className="text-accent" />
                </div>
                <div>
                    <CardTitle className="text-lg">STK Push Integration</CardTitle>
                    <CardDescription className="text-white/60">Zero Liability Tokenization</CardDescription>
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

          <Button onClick={handleLipa} disabled={isLoading} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20">
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : "Anzisha STK Push"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
