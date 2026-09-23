"use client";

import { useUser } from "@/supabase/auth/use-user";
import { useTable, type TableQuery } from "@/supabase/use-table";
import { updateRowNonBlocking } from "@/supabase/non-blocking-updates";
import { riderFromRow, type RiderRow } from "@/supabase/mappers";
import type { ProfileRow } from "@/supabase/mappers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, UserPlus, Info, MoreHorizontal, UserCog } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

const identity = (row: ProfileRow) => row;

export default function UserRegistryPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const profilesQuery: TableQuery = { table: "profiles" };
  const { data: profiles } = useTable<ProfileRow, ProfileRow>(profilesQuery, identity);

  const ridersQuery: TableQuery = { table: "riders" };
  const { data: riders } = useTable<RiderRow, ReturnType<typeof riderFromRow>>(ridersQuery, riderFromRow);

  const staff = (profiles || []).filter((p) => p.role !== "rider");
  const riderProfiles = (profiles || []).filter((p) => p.role === "rider");

  // Which of those rider profiles already have a linked fleet record?
  const linkedProfileIds = useMemo(
    () => new Set((riders || []).map((r) => r.profileId).filter(Boolean)),
    [riders]
  );

  const handleRoleChange = (profileId: string, name: string, newRole: string) => {
    updateRowNonBlocking("profiles", profileId, { role: newRole });
    toast({
      title: t("users.statusUpdatedTitle"),
      description: t("users.statusUpdatedDescription", { name: name || t("users.thisUser"), role: newRole }),
    });
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center font-bold">Access Denied: Strategic Admin Only</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter text-accent">{t("users.title")}</h1>
        <p className="text-muted-foreground">{t("users.subtitle")}</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck size={20} /> {t("users.staffCardTitle")}
          </CardTitle>
          <CardDescription className="text-white/60">{t("users.staffCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">{t("users.col.nameEmail")}</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">{t("users.col.systemRole")}</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">{t("users.col.access")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-black text-sm uppercase italic">{s.name || t("users.pendingName")}</p>
                    <p className="text-[0.65rem] text-muted-foreground font-bold">{s.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[0.6rem] font-black uppercase tracking-tighter">
                      {s.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("users.modifyAccess")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(s.id, s.name || "", 'supervisor')}>
                          {t("users.promoteSupervisor")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(s.id, s.name || "", 'recruiter')}>
                          {t("users.promoteRecruiter")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(s.id, s.name || "", 'admin')}>
                          {t("users.promoteAdmin")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(s.id, s.name || "", 'rider')} className="text-destructive">
                          {t("users.revokeStaffAccess")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-primary text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck size={20} /> {t("users.ridersCardTitle")}
          </CardTitle>
          <CardDescription className="text-white/80">{t("users.ridersCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">{t("users.col.nameEmail")}</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">{t("users.col.onboardingStatus")}</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">{t("users.col.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riderProfiles.map((profile) => {
                const isOnboarded = linkedProfileIds.has(profile.id);
                return (
                  <TableRow key={profile.id} className="hover:bg-muted/30">
                    <TableCell className="py-4">
                      <p className="font-black text-sm uppercase italic">{profile.name || t("users.incompleteProfile")}</p>
                      <p className="text-[0.65rem] text-muted-foreground font-bold">{profile.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOnboarded ? "default" : "secondary"} className="text-[0.6rem] font-black uppercase">
                        {isOnboarded ? t("users.verified") : t("users.pendingOnboarding")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <UserCog size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("users.authorizeAsStaff")}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleRoleChange(profile.id, profile.name || "", 'supervisor')}>
                            {t("users.makeSupervisor")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(profile.id, profile.name || "", 'recruiter')}>
                            {t("users.makeRecruiter")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {!isOnboarded ? (
                        <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary font-bold text-[0.6rem] uppercase h-8">
                          <Link href={`/onboard?email=${profile.email}&uid=${profile.id}&name=${encodeURIComponent(profile.name || '')}`}>
                             <UserPlus size={12} className="mr-1" /> {t("users.onboardProfile")}
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="ghost" className="text-muted-foreground text-[0.6rem] uppercase h-8">
                           <Link href="/fleet">{t("users.viewContract")}</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-secondary/30 p-6 rounded-2xl border border-dashed border-muted-foreground/20">
        <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Info size={14} /> {t("users.workflowTitle")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[0.7rem] font-medium leading-relaxed">
            <div className="space-y-3">
                <p className="font-bold uppercase text-accent border-b border-accent/20 pb-1">{t("users.workflow.safetyFirstTitle")}</p>
                <p>{t("users.workflow.safetyFirst1")}</p>
                <p>{t("users.workflow.safetyFirst2")}</p>
                <p>{t("users.workflow.safetyFirst3")}</p>
            </div>
             <div className="space-y-3">
                <p className="font-bold uppercase text-primary border-b border-primary/20 pb-1">{t("users.workflow.contractLinkingTitle")}</p>
                <p>{t("users.workflow.contractLinking1")}</p>
                <p>{t("users.workflow.contractLinking2")}</p>
                <p>{t("users.workflow.contractLinking3")}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
