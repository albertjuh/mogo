"use client";

import { RiderForm, type RiderFormValues } from "@/components/rider-form";
import { insertRowNonBlocking } from "@/supabase/non-blocking-updates";
import { riderToRow } from "@/supabase/mappers";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Info } from "lucide-react";
import { Suspense } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

function OnboardContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const email = searchParams.get('email') || "";
  const uid = searchParams.get('uid') || "";
  const name = searchParams.get('name') || "";

  const handleFormSubmit = (data: RiderFormValues) => {
    // If we have a uid, link this new fleet record to that existing auth account.
    insertRowNonBlocking("riders", {
      ...riderToRow({ ...data, profileId: uid || undefined }),
      active: true,
    });

    toast({
        title: t("onboard.toast.title"),
        description: t("onboard.toast.description", { name: data.name })
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
            {t("onboard.title.new")} <span className="text-primary">{t("onboard.title.onboarding")}</span>
        </h1>
        <p className="text-sm text-white/60 font-bold uppercase tracking-widest mt-1">{t("onboard.subtitle")}</p>
      </div>

      {uid && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
          <Info className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-accent uppercase">{t("onboard.linkingToAccount")}</p>
            <p className="text-sm text-muted-foreground">{t("onboard.completingProfileFor", { name: name || email })}</p>
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
        <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-2 text-center">{t("onboard.checklist.title")}</h4>
        <ul className="grid grid-cols-2 gap-4 text-[0.65rem] font-bold uppercase text-muted-foreground/80">
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> {t("onboard.checklist.verifyNida")}</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> {t("onboard.checklist.checkGuarantor")}</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> {t("onboard.checklist.confirmPlate")}</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full" /> {t("onboard.checklist.collectPassport")}</li>
        </ul>
      </div>
    </div>
  );
}

export default function OnboardPage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="p-12 text-center">{t("onboard.loading")}</div>}>
            <OnboardContent />
        </Suspense>
    )
}
