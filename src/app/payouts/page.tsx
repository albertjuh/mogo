"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import { getPayoutFee, initiatePayout } from "@/app/actions/payouts";
import { Loader2, Send, Banknote, ReceiptText } from "lucide-react";

export default function PayoutsPage() {
  const { user, firebaseUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [narration, setNarration] = useState("");
  const [fee, setFee] = useState<{ feeAmount: number; totalAmount: number } | null>(null);
  const [isCheckingFee, setIsCheckingFee] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const payoutsQuery = useMemoFirebase(() => {
    if (!user || user.role !== "admin") return null;
    return query(collection(db, "payouts"), orderBy("recordedAt", "desc"));
  }, [db, user]);
  const { data: payouts } = useCollection(payoutsQuery);

  const handleCheckFee = async () => {
    const amountNum = Number(amount);
    if (!firebaseUser || !amount || isNaN(amountNum) || amountNum < 5000) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Minimum payout is TZS 5,000." });
      return;
    }

    setIsCheckingFee(true);
    setFee(null);
    try {
      const idToken = await firebaseUser.getIdToken();
      const result = await getPayoutFee(idToken, amountNum);
      if (result.success && result.feeAmount !== undefined && result.totalAmount !== undefined) {
        setFee({ feeAmount: result.feeAmount, totalAmount: result.totalAmount });
      } else {
        toast({ variant: "destructive", title: "Could not calculate fee", description: result.error });
      }
    } finally {
      setIsCheckingFee(false);
    }
  };

  const handleSend = async () => {
    if (!firebaseUser) return;
    const amountNum = Number(amount);

    setIsSending(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      const result = await initiatePayout(idToken, amountNum, phoneNumber, recipientName, narration || undefined);

      if (result.success) {
        toast({ title: "Payout Sent", description: `Ref: ${result.reference}` });
        setAmount("");
        setPhoneNumber("");
        setRecipientName("");
        setNarration("");
        setFee(null);
      } else {
        toast({ variant: "destructive", title: "Payout Failed", description: result.error });
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
        <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter">Withdraw Funds</h1>
        <p className="text-muted-foreground">Send money from the Snippe balance to a mobile number.</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Banknote className="text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Mobile Money Payout</CardTitle>
              <CardDescription className="text-white/60">Funds settle to the recipient's wallet.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Amount (TZS)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setFee(null);
              }}
              placeholder="50000"
              className="text-2xl font-black h-14 border-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Recipient Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Recipient Name
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
              Narration (Optional)
            </Label>
            <Input
              id="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Weekly earnings withdrawal"
            />
          </div>

          {fee && (
            <div className="bg-secondary/30 p-4 rounded-xl border border-dashed space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">TZS {Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-bold">TZS {fee.feeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="font-bold">Total Deducted</span>
                <span className="font-black text-primary">TZS {fee.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCheckFee}
              disabled={isCheckingFee || isSending}
              className="flex-1 h-12 font-bold"
            >
              {isCheckingFee ? <Loader2 className="animate-spin" /> : "Preview Fee"}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !fee || !phoneNumber || !recipientName}
              className="flex-1 h-12 font-bold shadow-lg shadow-primary/20"
            >
              {isSending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Send Payout
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-black uppercase tracking-tight">Recent Withdrawals</h2>
        {payouts?.map((payout) => (
          <Card key={payout.id} className="border-none shadow-sm bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{payout.recipientName}</p>
                <p className="text-[0.65rem] text-muted-foreground font-bold tracking-widest uppercase">
                  {payout.phoneNumber} • {format(parseISO(payout.recordedAt), "dd MMM, HH:mm")}
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
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No withdrawals yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
