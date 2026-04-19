
"use client";

import { RiderForm, type RiderFormValues } from "@/components/rider-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialBikes } from "@/lib/data";
import type { Rider, Bike } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function OnboardPage() {
  const [riders, setRiders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [bikes] = useLocalStorage<Bike[]>("bikes", initialBikes);
  const { toast } = useToast();
  const router = useRouter();

  const handleFormSubmit = (data: RiderFormValues) => {
    const newRider: Rider = {
      id: `rider-${Date.now()}`,
      ...data,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setRiders([...riders, newRider]);
    toast({ 
        title: "Rider Onboarded Successfully", 
        description: `${data.name} has been added to the fleet. You can now view their contract in the Fleet list.` 
    });
    router.push("/fleet");
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent text-white -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-8 rounded-b-3xl relative overflow-hidden border-b-4 border-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserPlus size={120} />
        </div>
        <h1 className="font-black text-3xl italic uppercase tracking-tighter">
            New <span className="text-primary">Onboarding</span>
        </h1>
        <p className="text-sm text-white/60 font-bold uppercase tracking-widest mt-1">Data Collection for Mkataba</p>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-6">
            <RiderForm
                bikes={bikes}
                onSubmit={handleFormSubmit}
                onCancel={() => router.back()}
            />
        </CardContent>
      </Card>

      <div className="bg-secondary/50 p-6 rounded-2xl border border-dashed border-muted-foreground/20">
        <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-2 text-center">Recruitment Checklist</h4>
        <ul className="grid grid-cols-2 gap-4 text-[0.65rem] font-bold uppercase text-muted-foreground/80">
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Verify NIDA ID</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Check Guarantor</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Confirm Plate No.</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> Collect Passport Pic</li>
        </ul>
      </div>
    </div>
  );
}
