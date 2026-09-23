"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/supabase/auth/use-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Loader2, ShieldAlert, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AccountPage() {
  const { user, logout, deleteAccount } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);

    if (result.success) {
      toast({ title: t("account.delete.successTitle"), description: t("account.delete.successDescription") });
      router.push("/login");
    } else {
      toast({ variant: "destructive", title: t("account.delete.errorTitle"), description: result.error });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg">
      <header>
        <h1 className="text-3xl font-bold font-headline">{t("account.title")}</h1>
        <p className="text-muted-foreground">{t("account.subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("account.profile.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-semibold">{t("account.profile.name")}</span> {user.name || "—"}</p>
          <p><span className="font-semibold">{t("account.profile.email")}</span> {user.email}</p>
          <p><span className="font-semibold">{t("account.profile.role")}</span> {user.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText size={18} /> {t("account.legal.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="text-primary underline underline-offset-2">{t("account.legal.privacy")}</Link>
          <Link href="/terms" className="text-primary underline underline-offset-2">{t("account.legal.terms")}</Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("account.session.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" /> {t("account.session.signOut")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <ShieldAlert size={18} /> {t("account.danger.title")}
          </CardTitle>
          <CardDescription>
            {t("account.danger.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => setConfirmOpen(true)}>
            {t("account.danger.deleteButton")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("account.deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("account.deleteDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("account.deleteDialog.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
