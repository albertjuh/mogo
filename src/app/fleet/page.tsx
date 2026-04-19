
"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Edit, Trash2, FileText, Download, Printer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatISO as dateToISO } from "date-fns/formatISO";

import type { Rider, Bike } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { initialRiders, initialBikes } from "@/lib/data";
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

export default function FleetPage() {
  const [riders, setRiders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [bikes] = useLocalStorage<Bike[]>("bikes", initialBikes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { toast } = useToast();

  const getBikeInfo = (bikeId: string) => {
    return bikes.find((bike) => bike.id === bikeId);
  };

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
      setRiders((prev) => prev.filter((r) => r.id !== selectedRider.id));
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
      const updatedRider = { ...selectedRider, ...data, contractEnd: dateToISO(data.contractStart) }; // Simplified for now
      setRiders(riders.map(r => r.id === selectedRider.id ? updatedRider : r));
      toast({ title: "Rider Updated", description: `${data.name}'s details have been saved.` });
    } else {
      const newRider: Rider = {
        id: `rider-${Date.now()}`,
        ...data,
        active: true,
        contractEnd: dateToISO(addDays(data.contractStart, 540)), // Default 18 months
        createdAt: new Date().toISOString(),
        bikeId: "bike-custom" // Logic handled in form submit
      };
      setRiders([...riders, newRider]);
      toast({ title: "Rider Added", description: `${data.name} is now part of your fleet.` });
    }
    setIsFormOpen(false);
    setSelectedRider(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedRider(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <div>
            <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter">Boda Fleet</h1>
            <p className="text-muted-foreground font-medium">Manage riders and hire-purchase contracts.</p>
        </div>
      </header>

      {riders.length === 0 ? (
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
          {riders.map((rider) => {
            const bike = getBikeInfo(rider.bikeId);
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
                        <p className="text-xs font-bold">TZS {rider.dailyFee.toLocaleString()}</p>
                    </div>
                  </div>
                  
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
                bikes={bikes}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Contract Preview Modal */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden">
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
            <ScrollArea className="flex-1 p-8 font-serif text-sm leading-relaxed bg-white">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center font-bold underline text-lg uppercase">MKATABA WA MAKABIDHIANO YA {selectedRider?.vehicleType === 'Bajaji' ? 'BAJAJI' : 'PIKIPIKI [BODABODA]'}</div>
                    
                    <div className="space-y-1">
                        <p><strong>JINA LA MMILIKI:</strong> BODA EMPIRE / MOGO CONNECT</p>
                        <p><strong>JINA LA ANAEKABIDHIWA:</strong> {selectedRider?.name}</p>
                        <p><strong>NAMBA YA USAJILI:</strong> {selectedRider?.plateNumber}</p>
                        <p><strong>AINA YA CHOMBO:</strong> {selectedRider?.vehicleType} • {selectedRider?.modelNumber}</p>
                        <p><strong>CHASSIS NUMBER:</strong> {selectedRider?.chassisNumber || '…………………………'}</p>
                        <p><strong>ENGINE NUMBER:</strong> {selectedRider?.engineNumber || '…………………………'}</p>
                    </div>

                    <div className="space-y-4">
                        <p><strong>MAKAMIDHIANO:</strong> Mimi Boda Empire tarehe {selectedRider ? format(parseISO(selectedRider.contractStart), 'dd/MM/yyyy') : '……'} nimemkabidhi ndugu {selectedRider?.name} mali iliyotajwa hapo juu kwa hiari yangu mwenyewe nikiwa na akili zangu timamu, na tumekubaliana atulipe kiasi cha shilingi {selectedRider?.dailyFee.toLocaleString()} kwa siku kwa muda wa miezi {selectedRider?.contractTermMonths || 18}.</p>
                        
                        <p><strong>MASHARTI YA MKATABA:</strong></p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Ni lazima kuleta {selectedRider?.vehicleType.toLowerCase()} kila mwisho wa mwezi kwa mwenye mali ili aione kuhakikisha usalama.</li>
                            <li>Ni lazima kuhakikisha {selectedRider?.vehicleType.toLowerCase()} inafanyiwa matengenezo (service) kila wakati.</li>
                            <li>Ni marufuku kumwazima/kumpa mtu yoyote chombo hiki ndani ya kipindi cha mkataba.</li>
                            <li>Ni lazima kurejesha kiasi cha shilingi {(selectedRider?.dailyFee || 10000) * 10} kila siku ya 10.</li>
                        </ol>

                        <p><strong>MDHAMINI:</strong> Mimi {selectedRider?.guarantorName || '…………………………'} nikiwa na akili zangu timamu nakubali kumdhamini {selectedRider?.name} na nakubali kuwajibika na kulipa fidia endapo atapoteza/ataaribu/atakimbia na {selectedRider?.vehicleType.toLowerCase()} hii.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 text-xs border-t">
                        <div className="space-y-4">
                            <p><strong>Mwenye Mali Sahihi:</strong> <br/><br/> …………………………………</p>
                            <p><strong>Mdhamini Sahihi:</strong> <br/><br/> …………………………………</p>
                        </div>
                        <div className="space-y-4 text-right">
                            <p><strong>Dereva Sahihi:</strong> <br/><br/> …………………………………</p>
                            <p><strong>Mwenyekiti Sahihi:</strong> <br/><br/> …………………………………</p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
