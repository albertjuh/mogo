
"use client";

import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useUser } from "@/firebase/auth/use-user";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, startOfDay } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, User, CheckCircle2 } from "lucide-react";

export default function CollectPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const isManager = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'recruiter';

  const ridersQuery = useMemoFirebase(() => {
    if (!user || !isManager) return null;
    return collection(db, "riders");
  }, [db, user, isManager]);
  const { data: riders } = useCollection(ridersQuery);

  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  const todayStr = useMemo(() => clientNow ? format(clientNow, 'yyyy-MM-dd') : '', [clientNow]);
  const headerDate = useMemo(() => clientNow ? format(clientNow, 'eeee, dd MMMM') : 'Loading...', [clientNow]);

  const handlePaymentToggle = (riderId: string, dailyFee: number) => {
    if (!todayStr || !user) return;

    const gatewayRef = `CASH-${Math.random().toString(36).substring(7).toUpperCase()}`;

    addDocumentNonBlocking(collection(db, "payments"), {
      riderId,
      amount: dailyFee,
      gatewayRef,
      status: 'verified',
      recordedAt: new Date().toISOString(),
      verifiedBy: user.id
    });

    toast({
      title: "💰 Malipo Yamepokelewa!",
      description: `Ref: ${gatewayRef}`
    });
  };

  if (!isManager) {
    return <div className="p-12 text-center text-muted-foreground font-bold">Unauthorized Access</div>;
  }

  if (!riders) return null;

  return (
    <div className="space-y-6">
      <div className="bg-accent text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-6 rounded-b-3xl relative overflow-hidden border-b-4 border-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
            <DollarSign size={120} />
        </div>
        <p className="text-sm uppercase text-white/60 font-bold tracking-widest">{headerDate}</p>
        <h1 className="font-black text-3xl my-1 italic uppercase tracking-tighter">
            Daily <span className="text-primary">Collection</span>
        </h1>
      </div>

      <div className="space-y-3">
        {riders.map(rider => (
          <Card key={rider.id} className="border-none shadow-sm transition-all duration-300 bg-white hover:shadow-md relative overflow-hidden">
            <CardContent className="p-4 pl-6 flex justify-between items-center">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <div className="bg-secondary/50 p-1 rounded-md">
                        <User size={14} className="text-muted-foreground" />
                    </div>
                    <p className="font-black italic uppercase text-sm tracking-tight text-accent">{rider.name}</p>
                    <Badge variant="outline" className="text-[0.5rem] font-black uppercase px-1.5 h-4 border-muted-foreground/20">
                        {rider.paymentFrequency}
                    </Badge>
                </div>
                <p className="text-[0.6rem] text-muted-foreground font-black tracking-widest uppercase">{rider.plateNumber}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[0.7rem] text-accent font-black">
                        TZS {rider.dailyFee?.toLocaleString()}
                    </p>
                </div>
                <Switch
                  className="data-[state=checked]:bg-primary"
                  onCheckedChange={() => handlePaymentToggle(rider.id, rider.dailyFee)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
