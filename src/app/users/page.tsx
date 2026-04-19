
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ShieldCheck, UserCheck, UserPlus, Info, MoreHorizontal, UserCog } from "lucide-react";
import Link from "next/link";
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

export default function UserManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const adminsQuery = useMemoFirebase(() => collection(db, "admins"), [db]);
  const supervisorsQuery = useMemoFirebase(() => collection(db, "supervisors"), [db]);
  const recruitersQuery = useMemoFirebase(() => collection(db, "recruiters"), [db]);
  const ridersQuery = useMemoFirebase(() => collection(db, "riders"), [db]);

  const { data: admins } = useCollection(adminsQuery);
  const { data: supervisors } = useCollection(supervisorsQuery);
  const { data: recruiters } = useCollection(recruitersQuery);
  const { data: riders } = useCollection(ridersQuery);

  const allStaff = [
    ...(admins || []).map(u => ({ ...u, role: 'admin' as const })),
    ...(supervisors || []).map(u => ({ ...u, role: 'supervisor' as const })),
    ...(recruiters || []).map(u => ({ ...u, role: 'recruiter' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleRoleChange = async (targetUser: any, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    
    const collections: Record<string, string> = {
      'admin': 'admins',
      'supervisor': 'supervisors',
      'recruiter': 'recruiters',
      'rider': 'riders'
    };

    try {
      // 1. Copy to new collection
      const newRef = doc(db, collections[newRole], targetUser.id);
      await setDoc(newRef, {
        ...targetUser,
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // 2. Delete from old collection
      const oldRef = doc(db, collections[currentRole], targetUser.id);
      await deleteDoc(oldRef);

      toast({ 
        title: "Role Updated", 
        description: `${targetUser.name} is now a ${newRole}.` 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "Update Failed", 
        description: "Permissions might be restricted." 
      });
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter text-accent">User Registry</h1>
        <p className="text-muted-foreground">Manage digital identities and staff access.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-none shadow-md">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Staff</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-2xl font-black text-accent">{allStaff.length} Accounts</div>
            </CardContent>
        </Card>
         <Card className="bg-white border-none shadow-md">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registered Riders</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-2xl font-black text-primary">{riders?.length || 0} Accounts</div>
            </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck size={20} /> Staff Accounts
          </CardTitle>
          <CardDescription className="text-white/60">Verified management and operations team.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Name & Email</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Role</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStaff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-black text-sm uppercase italic">{staff.name || "No Name"}</p>
                    <p className="text-[0.65rem] text-muted-foreground font-bold">{staff.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[0.6rem] font-black uppercase tracking-tighter">
                      {staff.role}
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
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'supervisor')}>
                          Make Supervisor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'recruiter')}>
                          Make Recruiter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'rider')} className="text-destructive">
                          Demote to Rider
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
            <UserCheck size={20} /> Rider Accounts
          </CardTitle>
          <CardDescription className="text-white/80">Digital identities for boda drivers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Name & Email</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(riders || []).map((rider) => (
                <TableRow key={rider.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-black text-sm uppercase italic">{rider.name || "No Name"}</p>
                    <p className="text-[0.65rem] text-muted-foreground font-bold">{rider.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rider.plateNumber ? "default" : "secondary"} className="text-[0.6rem] font-black uppercase">
                      {rider.plateNumber ? "Onboarded" : "Pending"}
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
                        <DropdownMenuLabel>Promote to Staff</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRoleChange(rider, 'rider', 'supervisor')}>
                          Make Supervisor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(rider, 'rider', 'recruiter')}>
                          Make Recruiter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {!rider.plateNumber ? (
                      <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary font-bold text-[0.6rem] uppercase h-8">
                        <Link href={`/onboard?email=${rider.email}&uid=${rider.id}&name=${encodeURIComponent(rider.name || '')}`}>
                           <UserPlus size={12} className="mr-1" /> Onboard Profile
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="ghost" className="text-muted-foreground text-[0.6rem] uppercase h-8">
                         <Link href="/fleet">View Details</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="bg-accent/5 p-6 rounded-2xl border border-dashed border-accent/20">
        <h4 className="font-black text-xs uppercase tracking-widest text-accent mb-4 flex items-center justify-center gap-2">
            <Info size={14} /> Safer Management Workflow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[0.7rem] font-medium">
            <div className="space-y-3">
                <p className="font-bold uppercase text-accent border-b border-accent/20 pb-1">Role Verification:</p>
                <p>1. Strangers can no longer sign up as Supervisors or Recruiters.</p>
                <p>2. Everyone who registers starts as a basic **Rider** with zero privileges.</p>
                <p>3. You verify their identity first, then use the **cog icon** to promote them to staff.</p>
            </div>
             <div className="space-y-3">
                <p className="font-bold uppercase text-primary border-b border-primary/20 pb-1">Google One-Tap:</p>
                <p>1. Encourage staff to use Google Sign-In. It is safer as Google handles bot detection and 2FA.</p>
                <p>2. It is simpler because they don't have to remember a separate "Boda Empire" password.</p>
                <p>3. Their verified Google Name is automatically imported to your registry.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
