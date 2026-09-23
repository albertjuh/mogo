"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, MoreVertical, Edit, Trash2, FileText, Download, Printer, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useTable, type TableQuery } from "@/supabase/use-table";
import { updateRowNonBlocking, deleteRowNonBlocking, insertRowNonBlocking } from "@/supabase/non-blocking-updates";
import { riderFromRow, paymentFromRow, riderToRow, type RiderRow, type PaymentRow } from "@/supabase/mappers";

import type { Rider } from "@/lib/types";
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
import { useUser } from "@/supabase/auth/use-user";
import { useLanguage } from "@/lib/i18n/language-context";

export default function FleetPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  const isManager = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'recruiter';

  const ridersQuery: TableQuery | null = user && isManager ? { table: "riders" } : null;
  const { data: riders, isLoading } = useTable<RiderRow, ReturnType<typeof riderFromRow>>(ridersQuery, riderFromRow);

  const paymentsQuery: TableQuery | null = user && isManager ? { table: "payments" } : null;
  const { data: allPayments } = useTable<PaymentRow, ReturnType<typeof paymentFromRow>>(paymentsQuery, paymentFromRow);

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
      deleteRowNonBlocking("riders", selectedRider.id);
      toast({
        title: t("fleet.toast.riderDeleted.title"),
        description: t("fleet.toast.riderDeleted.description", { name: selectedRider.name }),
      });
    }
    setIsDeleteAlertOpen(false);
    setSelectedRider(null);
  };

  const handleFormSubmit = (data: RiderFormValues) => {
    if (selectedRider) {
      updateRowNonBlocking("riders", selectedRider.id, riderToRow(data));
      toast({ title: t("fleet.toast.riderUpdated.title"), description: t("fleet.toast.riderUpdated.description", { name: data.name }) });
    } else {
      insertRowNonBlocking("riders", { ...riderToRow(data), active: true });
      toast({ title: t("fleet.toast.riderAdded.title"), description: t("fleet.toast.riderAdded.description", { name: data.name }) });
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
    return <div className="p-12 text-center text-muted-foreground font-bold">{t("fleet.unauthorized")}</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black font-headline italic uppercase tracking-tighter text-accent">{t("fleet.title")}</h1>
            <p className="text-muted-foreground font-medium">{t("fleet.subtitle")}</p>
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
                <CardTitle className="font-headline">{t("fleet.empty.title")}</CardTitle>
                <CardDescription>{t("fleet.empty.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => { setSelectedRider(null); setIsFormOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> {t("fleet.empty.addRider")}
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
                        <Edit className="mr-2 h-4 w-4" /> {t("fleet.menu.editProfile")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewContract(rider)}>
                        <FileText className="mr-2 h-4 w-4 text-primary" /> {t("fleet.menu.viewContract")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(rider)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/30 p-2 rounded-lg">
                        <p className="text-[0.6rem] uppercase font-black text-muted-foreground">{t("fleet.card.vehicle")}</p>
                        <p className="text-xs font-bold truncate">{rider.plateNumber} • {rider.vehicleType}</p>
                    </div>
                    <div className="bg-secondary/30 p-2 rounded-lg">
                        <p className="text-[0.6rem] uppercase font-black text-muted-foreground">{t("fleet.card.dailyFee")}</p>
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
                            {balance.status === 'debt' ? t("fleet.balance.debt") : balance.status === 'credit' ? t("fleet.balance.credit") : t("fleet.balance.current")}
                        </span>
                        <span>
                            {balance.status === 'debt' && `- TZS ${Math.abs(balance.balance).toLocaleString()}`}
                            {balance.status === 'credit' && `+ TZS ${balance.balance.toLocaleString()}`}
                            {balance.status === 'current' && 'TZS 0'}
                        </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground pt-1 border-t border-muted/50">
                    <span>{t("fleet.card.guarantor", { name: rider.guarantorName || t("fleet.card.notAvailable") })}</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-[0.6rem] text-primary" onClick={() => handleViewContract(rider)}>
                        {t("fleet.card.viewMkataba")} <FileText size={10} className="ml-1" />
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
                {selectedRider ? t("fleet.dialog.editRider") : t("fleet.dialog.newOnboarding")}
            </DialogTitle>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">{t("fleet.dialog.recruitmentDataCollection")}</p>
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
                    <DialogTitle className="text-lg font-black italic uppercase tracking-tighter">{t("fleet.contract.dialogTitle")}</DialogTitle>
                    <p className="text-[0.6rem] font-bold text-white/50 uppercase tracking-widest">{t("fleet.contract.previewFor", { name: selectedRider?.name || "" })}</p>
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
                    <div className="text-center font-black underline text-lg uppercase">{t("fleet.contract.docHeader")}</div>

                    <div className="grid grid-cols-1 gap-1 text-xs">
                        <p><strong>{t("fleet.contract.ownerNameLabel")}</strong> KING BARIKI</p>
                        <p><strong>{t("fleet.contract.recipientNameLabel")}</strong> {selectedRider?.name}</p>
                        <p><strong>{t("fleet.contract.registrationNoLabel")}</strong> {selectedRider?.plateNumber}</p>
                        <p><strong>{t("fleet.contract.vehicleTypeLabel")}</strong> {selectedRider?.vehicleType}</p>
                        <p><strong>{t("fleet.contract.modelNumberLabel")}</strong> {selectedRider?.modelNumber}</p>
                        <p><strong>{t("fleet.contract.chassisNumberLabel")}</strong> {selectedRider?.chassisNumber}</p>
                        <p><strong>{t("fleet.contract.engineNumberLabel")}</strong> {selectedRider?.engineNumber}</p>
                        <p><strong>{t("fleet.contract.engineCapacityLabel")}</strong> {selectedRider?.engineCapacity}</p>
                    </div>

                    <div className="space-y-4">
                        <p><strong>{t("fleet.contract.ownerClauseTitle")}</strong> {t("fleet.contract.ownerClause", {
                            date: safeFormatDate(selectedRider?.contractStart),
                            name: selectedRider?.name || "",
                            term: String(selectedRider?.contractTermMonths || 18),
                            endDate: safeFormatDate(selectedRider?.contractEnd),
                        })}</p>

                        <p><strong>{t("fleet.contract.recipientClauseTitle")}</strong> {t("fleet.contract.recipientClause", {
                            name: selectedRider?.name || "",
                            date: safeFormatDate(selectedRider?.contractStart),
                            endDate: safeFormatDate(selectedRider?.contractEnd),
                        })}</p>

                        <p><strong>{t("fleet.contract.termsTitle")}</strong></p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>{t("fleet.contract.term1")}</li>
                            <li>{t("fleet.contract.term2")}</li>
                            <li>{t("fleet.contract.term3")}</li>
                            <li>{t("fleet.contract.term4")}</li>
                            <li>{t("fleet.contract.term5")}</li>
                            <li>{t("fleet.contract.term6")}</li>
                            <li>{t("fleet.contract.term7")}</li>
                            <li>{t("fleet.contract.term8")}</li>
                        </ol>

                        <p><strong>{t("fleet.contract.breachTitle")}</strong> {t("fleet.contract.breachClause", { name: selectedRider?.name || "" })}</p>

                        <p><strong>{t("fleet.contract.guarantorTitle")}</strong> {t("fleet.contract.guarantorClause", {
                            guarantorName: selectedRider?.guarantorName || "",
                            name: selectedRider?.name || "",
                        })}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 text-[0.6rem] border-t border-black/10">
                        <div className="space-y-4">
                            <p><strong>{t("fleet.contract.role.owner")}</strong> <br/> {t("fleet.contract.label.name")} KING BARIKI <br/> {t("fleet.contract.label.signature")} …………………………………</p>
                            <p><strong>{t("fleet.contract.role.ownerWitness")}</strong> <br/> {t("fleet.contract.label.name")} ………………………………… <br/> {t("fleet.contract.label.signature")} …………………………………</p>
                        </div>
                        <div className="space-y-4">
                            <p><strong>{t("fleet.contract.role.recipient")}</strong> <br/> {t("fleet.contract.label.name")} {selectedRider?.name} <br/> {t("fleet.contract.label.signature")} …………………………………</p>
                            <p><strong>{t("fleet.contract.role.guarantor")}</strong> <br/> {t("fleet.contract.label.name")} {selectedRider?.guarantorName} <br/> {t("fleet.contract.label.signature")} …………………………………</p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("fleet.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("fleet.deleteDialog.description", { name: selectedRider?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
