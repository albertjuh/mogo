"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, CheckCircle2 } from "lucide-react";

export default function LipaPage() {
  const [amount, setAmount] = useState("15000");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleLipa = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({ variant: "destructive", title: "Invalid amount" });
      return;
    }

    setIsLoading(true);
    // Simulate STK Push
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({ title: "STK Push Sent", description: "Please enter your PIN on your phone." });
    }, 2000);
  };

  if (isSuccess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-500">
            <CheckCircle2 size={80} className="text-primary mb-6" />
            <h2 className="text-3xl font-black mb-2">Transaction Initiated!</h2>
            <p className="text-muted-foreground mb-8">Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.</p>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full">Pay Another Amount</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline">Lipa kwa Mogo</h1>
        <p className="text-muted-foreground">Easy payment via M-Pesa or Tigo Pesa</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-secondary rounded-t-xl">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Smartphone className="text-primary-foreground" />
                </div>
                <div>
                    <CardTitle className="text-lg">One-Click Payment</CardTitle>
                    <CardDescription>STK Push Integration</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Amount to Pay (TZS)</Label>
            <Input 
                id="amount" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-black h-14"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["5000", "15000", "50000"].map(val => (
                <Button 
                    key={val} 
                    variant="outline" 
                    onClick={() => setAmount(val)}
                    className={amount === val ? "border-primary bg-primary/10" : ""}
                >
                    {Number(val).toLocaleString()}
                </Button>
            ))}
          </div>

          <Button onClick={handleLipa} disabled={isLoading} className="w-full h-14 text-lg font-bold">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 animate-spin" /> Sending Prompt...
                </>
            ) : "Initiate STK Push"}
          </Button>
          
          <p className="text-[0.65rem] text-center text-muted-foreground">
            A payment request will be sent to the phone number registered with your Mogo account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
