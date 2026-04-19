"use client";

import { RiderForm, type RiderFormValues } from "@/components/rider-form";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Info } from "lucide-react";
import { Suspense } from "react";

function OnboardContent() {
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email') || "";
  const uid = searchParams.get('uid') || "";
  const name = searchParams.get('name') || "";

  const handleFormSubmit = (data: RiderFormValues) => {
    // If we have a UID, we use it as the document ID to link the profile to the Auth account
    const docId = uid || `rider-${Date.now()}`;
    
    setDoc(doc(db, "riders", docId), {
      ...data,
      active: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    
    toast({ 
        title: "Rider Onboarded Successfully", 
        description: `${data.name} has been added to the fleet and linked to their account.` 
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

      {uid && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
          <Info className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-accent uppercase">Linking to Account</p>
            <p className="text-sm text-muted-foreground">Completing profile for <span className="font-bold text-accent">{name || email}</span>.</p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-6">
            <RiderForm
                initialEmail={email}
                initialName={name}
                bikes={[]}
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

export default function OnboardPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading onboarding form...</div>}>
            <OnboardContent />
        </Suspense>
    )
}
