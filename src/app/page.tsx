"use client";

import { useState } from "react";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
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
import { RiderForm, type RiderFormValues } from "@/components/rider-form";
import { useToast } from "@/hooks/use-toast";
import { BodaEmpireIcon } from "@/components/icons";

export default function FleetPage() {
  const [riders, setRiders] = useLocalStorage<Rider[]>("riders", initialRiders);
  const [bikes] = useLocalStorage<Bike[]>("bikes", initialBikes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  const { toast } = useToast();

  const getBikeInfo = (bikeId: string) => {
    return bikes.find((bike) => bike.id === bikeId);
  };

  const handleEdit = (rider: Rider) => {
    setSelectedRider(rider);
    setIsFormOpen(true);
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
      const updatedRider = { ...selectedRider, ...data, contractEnd: dateToISO(data.contractEnd) };
      setRiders(riders.map(r => r.id === selectedRider.id ? updatedRider : r));
      toast({ title: "Rider Updated", description: `${data.name}'s details have been saved.` });
    } else {
      const newRider: Rider = {
        id: `rider-${Date.now()}`,
        ...data,
        contractEnd: dateToISO(data.contractEnd),
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
        <BodaEmpireIcon className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">My Fleet</h1>
            <p className="text-muted-foreground">Your riders and their bodas.</p>
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
            const contractEndDate = parseISO(rider.contractEnd);
            return (
              <Card key={rider.id}>
                <CardHeader className="flex flex-row items-start justify-between p-4">
                  <div>
                    <CardTitle className="font-headline">{rider.name}</CardTitle>
                    <CardDescription>{rider.phone}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-my-2 -mr-2 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(rider)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(rider)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-2 text-sm px-4 pb-4">
                  <p><strong>Boda:</strong> {bike?.model || "N/A"} ({bike?.plateNumber || "N/A"})</p>
                  <p><strong>Contract Ends:</strong> {format(contractEndDate, "PPP")} ({formatDistanceToNow(contractEndDate, { addSuffix: true })})</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAB and Dialog */}
      <Dialog open={isFormOpen} onOpenChange={open => { if (!open) closeForm(); else setIsFormOpen(open);}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedRider ? "Edit Rider" : "Add a New Rider"}</DialogTitle>
          </DialogHeader>
          <RiderForm
            rider={selectedRider}
            bikes={bikes}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>
      
      <Button
        aria-label="Add Rider"
        className="absolute bottom-20 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => {
            setSelectedRider(null);
            setIsFormOpen(true);
        }}
        >
        <Plus className="h-8 w-8" />
      </Button>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedRider?.name} and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
