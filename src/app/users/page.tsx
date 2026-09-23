"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export default function UserRegistryPage() {
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
  ];

  const handleRoleChange = async (targetUser: any, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    
    const collections: Record<string, string> = {
      'admin': 'admins',
      'supervisor': 'supervisors',
      'recruiter': 'recruiters',
      'rider': 'riders'
    };

    try {
      // 1. Move doc to new role collection
      const newRef = doc(db, collections[newRole], targetUser.id);
      await setDoc(newRef, {
        ...targetUser,
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // 2. Remove from old role collection
      const oldRef = doc(db, collections[currentRole], targetUser.id);
      await deleteDoc(oldRef);

      toast({ 
        title: "Staff Status Updated", 
        description: `${targetUser.name} is now authorized as a ${newRole}.` 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        variant: "destructive", 
        title: "Operation Failed", 
        description: "Insufficient permissions to change system roles." 
      });
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-12 text-center font-bold">Access Denied: Strategic Admin Only</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter text-accent">Strategic Registry</h1>
        <p className="text-muted-foreground">Manage digital access and operational staff.</p>
      </header>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-accent text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck size={20} /> Management & Staff
          </CardTitle>
          <CardDescription className="text-white/60">Verified personnel with operational oversight.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Name & Email</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">System Role</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStaff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-black text-sm uppercase italic">{staff.name || "Pending Name"}</p>
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
                        <DropdownMenuLabel>Modify Access</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'supervisor')}>
                          Promote to Supervisor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'recruiter')}>
                          Promote to Recruiter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(staff, staff.role, 'rider')} className="text-destructive">
                          Revoke Staff Access
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
            <UserCheck size={20} /> Registered Riders
          </CardTitle>
          <CardDescription className="text-white/80">Riders waiting for contract onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 border-none">
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Name & Email</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest">Onboarding Status</TableHead>
                <TableHead className="font-bold text-[0.65rem] uppercase tracking-widest text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(riders || []).map((rider) => (
                <TableRow key={rider.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <p className="font-black text-sm uppercase italic">{rider.name || "Incomplete Profile"}</p>
                    <p className="text-[0.65rem] text-muted-foreground font-bold">{rider.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rider.plateNumber ? "default" : "secondary"} className="text-[0.6rem] font-black uppercase">
                      {rider.plateNumber ? "Verified" : "Pending Onboarding"}
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
                        <DropdownMenuLabel>Authorize as Staff</DropdownMenuLabel>
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
                         <Link href="/fleet">View Contract</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="bg-secondary/30 p-6 rounded-2xl border border-dashed border-muted-foreground/20">
        <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center justify-center gap-2">
            <Info size={14} /> Standard Operational Workflow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[0.7rem] font-medium leading-relaxed">
            <div className="space-y-3">
                <p className="font-bold uppercase text-accent border-b border-accent/20 pb-1">Safety First:</p>
                <p>1. Everyone registers at `/signup` with their verified email.</p>
                <p>2. They stay locked in the Activation Gate until email is clicked.</p>
                <p>3. Once verified, they appear here. Use the **cog icon** to promote trusted staff.</p>
            </div>
             <div className="space-y-3">
                <p className="font-bold uppercase text-primary border-b border-primary/20 pb-1">Contract Linking:</p>
                <p>1. Identify the new Rider in the table above.</p>
                <p>2. Click **"Onboard Profile"** to finalize their bajaji details.</p>
                <p>3. This links their legal Mkataba to their secure digital account for payments.</p>
            </div>
        </div>
      </div>
    </div>
  );
}