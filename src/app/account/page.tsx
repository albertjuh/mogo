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

export default function AccountPage() {
  const { user, logout, deleteAccount } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);

    if (result.success) {
      toast({ title: "Account deleted", description: "Your account and profile data have been removed." });
      router.push("/login");
    } else {
      toast({ variant: "destructive", title: "Could not delete account", description: result.error });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg">
      <header>
        <h1 className="text-3xl font-bold font-headline">Account</h1>
        <p className="text-muted-foreground">Manage your profile and data.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-semibold">Name:</span> {user.name || "—"}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText size={18} /> Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>
          <Link href="/terms" className="text-primary underline underline-offset-2">Terms of Service</Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <ShieldAlert size={18} /> Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and profile data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => setConfirmOpen(true)}>
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your login and profile record. Payment history tied to your
              account is retained for financial audit purposes as required by law.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
