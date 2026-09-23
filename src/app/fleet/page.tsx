"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, MoreVertical, Edit, Trash2, FileText, Download, Printer, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, setDoc } from "firebase/firestore";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

import type { Rider, Bike } from "@/lib/types";
import { initialBikes } from "@/lib/data";
import { computeRiderBalance } from "@/lib/balance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiderForm, type RiderFormValues } from "@/components/rider-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";

export default function FleetPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const isManager = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'recruiter';
  
  const ridersQuery = useMemoFirebase(() => {
    if (!user || !isManager) return null;
    return collection(db, "riders");
  }, [db, user, isManager]);
  const { data: riders, isLoading } = useCollection(ridersQuery);

  const paymentsQuery = useMemoFirebase(() => {
    if (!user || !isManager) return null;
    return collection(db, "payments");
  }, [db, user, isManager]);
  const { data: allPayments } = useCollection(paymentsQuery);

  const paymentsByRider = useMemo(() => {
    const map = new Map<string, typeof allPayments>();
    (allPayments || []).forEach((p) => {
      const list = map.get(p.riderId) || [];
      list.push(p);
      map.set(p.riderId, list);
    });
    return map;
  }, [allPayments]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  const handleEdit = (rider: Rider) => {
    setSelectedRider(rider);
    setIsFormOpen(true);
  };

  const handleViewContract = (rider: Rider) => {
    setSelectedRider(rider);
    setIsContractOpen(true);
  };

  const handleDelete = (rider: Rider) => {
    setSelectedRider(rider);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRider) {
      deleteDocumentNonBlocking(doc(db, "riders", selectedRider.id));
      toast({
        title: "Rider Deleted",
        description: `${selectedRider.name} has been removed from your fleet.`,
      });
    }
    setIsDeleteAlertOpen(false);
    setSelectedRider(null);
  };

  const handleFormSubmit = (data: RiderFormValues) => {
    if (selectedRider) {
      updateDocumentNonBlocking(doc(db, "riders", selectedRider.id), data);
      toast({ title: "Rider Updated", description: `${data.name}'s details have been saved.` });
    } else {
      addDocumentNonBlocking(collection(db, "riders"), {
        ...data,
        active: true,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Rider Added", description: `${data.name} is now part of your fleet.` });
    }
    setIsFormOpen(false);
    setSelectedRider(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedRider(null);
  }

  const safeFormatDate = (date: any) => {
    if (!date) return '……';
    try {
      let d: Date;
      if (typeof date === 'string') {
        d = parseISO(date);
      } else if (date.toDate) {
        d = date.toDate();
      } else if (date instanceof Date) {
        d = date;
      } else {
        return '……';
      }
      return isValid(d) ? format(d, 'dd/MM/yyyy') : '……';
    } catch (e) {
      return '……';
    }
  };

  if (!isManager) {
    return <div className="p-12 text-center text-muted-foreground font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter text-accent">Bajaji Fleet</h1>
            <p className="text-muted-foreground font-medium">Manage riders and hire-purchase contracts.</p>
        </div>
        <Button size="icon" className="rounded-full shadow-lg h-12 w-12" onClick={() => { setSelectedRider(null); setIsFormOpen(true); }}>
            <Plus />
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : riders?.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
            <CardHeader>
                <CardTitle className="font-headline">Your fleet is empty!</CardTitle>
                <CardDescription>Add your first rider to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => { setSelectedRider(null); setIsFormOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Rider
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {riders?.map((rider) => {
            const balance = computeRiderBalance(rider, paymentsByRider.get(rider.id) || []);
            return (
              <Card key={rider.id} className="border-none shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center font-black">
                        {rider.name.charAt(0)}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black uppercase italic tracking-tight">{rider.name}</CardTitle>
                        <CardDescription className="text-xs font-bold tracking-widest">{rider.phone}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-my-2 -mr-2 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(rider)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewContract(rider)}>
                        <FileText className="mr-2 h-4 w-4 text-primary" /> View Contract
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(rider)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/30 p-2 rounded-lg">
                        <p className="text-[0.6rem] uppercase font-black text-muted-foreground">Vehicle</p>
                        <p className="text-xs font-bold truncate">{rider.plateNumber} • {rider.vehicleType}</p>
                    </div>
                    <div className="bg-secondary/30 p-2 rounded-lg">
                        <p className="text-[0.6rem] uppercase font-black text-muted-foreground">Daily Fee</p>
                        <p className="text-xs font-bold">TZS {rider.dailyFee?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {rider.active && (
                    <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-black ${
                        balance.status === 'debt' ? 'bg-red-50 text-red-700' :
                        balance.status === 'credit' ? 'bg-green-50 text-green-700' :
                        'bg-secondary/30 text-muted-foreground'
                    }`}>
                        <span className="uppercase tracking-wider">
                            {balance.status === 'debt' ? 'Deni (Debt)' : balance.status === 'credit' ? 'Overdraft/Credit' : 'Current'}
                        </span>
                        <span>
                            {balance.status === 'debt' && `- TZS ${Math.abs(balance.balance).toLocaleString()}`}
                            {balance.status === 'credit' && `+ TZS ${balance.balance.toLocaleString()}`}
                            {balance.status === 'current' && 'TZS 0'}
                        </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground pt-1 border-t border-muted/50">
                    <span>Guarantor: {rider.guarantorName || 'N/A'}</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-[0.6rem] text-primary" onClick={() => handleViewContract(rider)}>
                        View Mkataba <FileText size={10} className="ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Onboarding Dialog */}
      <Dialog open={isFormOpen} onOpenChange={open => { if (!open) closeForm(); else setIsFormOpen(open);}}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <div className="bg-accent p-6 text-white">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {selectedRider ? "Edit Rider" : "New Onboarding"}
            </DialogTitle>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Recruitment Data Collection</p>
          </div>
          <div className="p-6">
            <RiderForm
                rider={selectedRider}
                bikes={[]}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Contract Preview Modal - Detailed Legal Content */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="sm:max-w-[650px] h-[90vh] flex flex-col p-0 overflow-hidden">
             <div className="bg-accent p-4 text-white flex justify-between items-center">
                <div>
                    <DialogTitle className="text-lg font-black italic uppercase tracking-tighter">Mkataba wa Makabidhiano</DialogTitle>
                    <p className="text-[0.6rem] font-bold text-white/50 uppercase tracking-widest">Legal Document Preview • {selectedRider?.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20">
                        <Printer className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 p-8 font-serif text-[0.8rem] leading-relaxed bg-white">
                <div className="max-w-2xl mx-auto space-y-6 text-justify">
                    <div className="text-center font-black underline text-lg uppercase">MKATABA WA MAKABIDHIANO YA BAJAJI</div>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs">
                        <p><strong>JINA LA MMILIKI:</strong> KING BARIKI</p>
                        <p><strong>JINA LA ANAEKABIDHIWA:</strong> {selectedRider?.name}</p>
                        <p><strong>NAMBA YA USAJILI:</strong> {selectedRider?.plateNumber}</p>
                        <p><strong>AINA YA CHOMBO:</strong> {selectedRider?.vehicleType}</p>
                        <p><strong>MODEL NUMBER:</strong> {selectedRider?.modelNumber}</p>
                        <p><strong>CHASSIS NUMBER:</strong> {selectedRider?.chassisNumber}</p>
                        <p><strong>ENGINE NUMBER:</strong> {selectedRider?.engineNumber}</p>
                        <p><strong>ENGINE CAPACITY:</strong> {selectedRider?.engineCapacity}</p>
                    </div>

                    <div className="space-y-4">
                        <p><strong>MMILIKI WA BAJAJI:</strong> Mimi King Bariki tarehe {safeFormatDate(selectedRider?.contractStart)} nimemkabidhi ndugu {selectedRider?.name} Mali iliyotajwa hapo juu kwa hiari yangu mwenyewe nikiwa na akili zangu timamu bila kushauriwa na mtu yeyote, na tumekubaliana atulipe kiasi cha shilingi 10,000 kwa siku [utaratibu wa malipo ni Tsh 100,000 kila siku ya 10] kwa mda wa miezi {selectedRider?.contractTermMonths || 18}. Mkataba huu ni kuanzia tarehe {safeFormatDate(selectedRider?.contractStart)} hadi tarehe {safeFormatDate(selectedRider?.contractEnd)} Itakuwa mwisho wa mkataba huu na bajaji itakuwa ni mali yake na atakabidhiwa kadi ya bajaji.</p>
                        
                        <p><strong>ANAEKABIDHIWA BAJAJI:</strong> Mimi {selectedRider?.name} nikiwa na akili zangu timamu na kwa hiari yangu mwenyewe bila kulazimishwa na mtu yeyote wala kushawishiwa nimekubali kupokea bajaji tajwa hapo juu kutoka kwa King Bariki leo tarehe {safeFormatDate(selectedRider?.contractStart)} hadi tarehe {safeFormatDate(selectedRider?.contractEnd)}. Na ninaambatanisha nakala ya kitambulisho changu cha mpiga kura/kitambulisho cha taifa/picha ya passport.</p>

                        <p><strong>MASHARTI YA MKATABA:</strong></p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Ni lazima kuleta chombo kila mwisho wa mwezi kwa mwenye mali ili aione kuhakikisha usalama wa chombo chake.</li>
                            <li>Ni lazima kuhakikisha chombo inafanyiwa matengenezo (service) kila wakati ili iendelee kubaki kwenye ubora.</li>
                            <li>Ni marufuku kumwazima/kumpa mtu yoyote chombo hiki ndani ya kipindi chote cha mkataba.</li>
                            <li>Ni lazima kurejesha kiasi cha shilingi 100,000/= kila siku ya 10.</li>
                            <li>Kuvunja/kukiuka sharti lolote la mkataba huu utakuwa umevunja mkataba mwenyewe.</li>
                            <li>Chombo lazima irudishwe kila siku ya Jumapili kwa ukaguzi wa wiki na kupatiwa kibali cha kuendelea kutumika.</li>
                            <li>Ni marufuku kutumia chombo hiki nje ya mipaka ya wilaya iliyoruhusiwa bila ruhusa ya maandishi kutoka kwa mmiliki.</li>
                            <li>Dereva ana wajibu wa kuhakikisha anafuata sheria zote za barabarani na kulipa faini zozote zitakazotokana na ukiukwaji wa sheria.</li>
                        </ol>

                        <p><strong>KUVUNJA MKATABA (ANAEKABIDHIWA):</strong> Mimi {selectedRider?.name} endapo nitavunja makubaliano haya ikiwa ni pamoja na kushindwa kulipa kiasi cha shilingi 10,000 kwa siku kwa kupitiliza siku 3 (tatu) kwa sababu zisizo za msingi nitakuwa nimevunja mkataba wangu mwenyewe and nitakuwa tayari kuwalipa ela yao yote wanayonidai na kuwakabidhi chombo chao kikiwa katika hali nzuri.</p>
                        
                        <p><strong>MDHAMINI:</strong> Mimi {selectedRider?.guarantorName} nikiwa na akili zangu timamu bila kulazimishwa nakubali kumdhamini {selectedRider?.name} mbele ya mwenyekiti, mwenye mali na shahidi wake na nakubali kuwajibika na kulipa fidia endapo atapoteza/ataaribu/atakimbia na chombo hiki au atashindwa kulipa kiasi chochote atakachokuwa anadaiwa ndani ya siku 14 za tukio.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 text-[0.6rem] border-t border-black/10">
                        <div className="space-y-4">
                            <p><strong>Mmiliki wa bajaji</strong> <br/> Jina: KING BARIKI <br/> Sahihi: …………………………………</p>
                            <p><strong>Shahidi wa mmiliki</strong> <br/> Jina: ………………………………… <br/> Sahihi: …………………………………</p>
                        </div>
                        <div className="space-y-4">
                            <p><strong>Aliekabidhiwa bajaji</strong> <br/> Jina: {selectedRider?.name} <br/> Sahihi: …………………………………</p>
                            <p><strong>Mdhamini</strong> <br/> Jina: {selectedRider?.guarantorName} <br/> Sahihi: …………………………………</p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove {selectedRider?.name} from the fleet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
