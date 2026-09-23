"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, User, Shield, CarFront, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Rider, Bike as BikeType } from "@/lib/types";
import { parseISO, addMonths, isValid } from "date-fns";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

// NOTE: Zod schemas are defined outside the React component, so they can't
// call the t() hook. These validation messages are kept as plain English
// strings (a deliberate simplification -- see i18n translation notes).
const riderFormSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  email: z.string().email("A valid email address is required."),
  phone: z.string().regex(/^(?:\+255|0)\d{9}$/, "A valid Tanzanian phone number is required."),
  vehicleType: z.literal('Bajaji'),
  plateNumber: z.string().min(3, "Registration number is required."),
  chassisNumber: z.string().min(5, "Chassis number is required for the contract."),
  engineNumber: z.string().min(5, "Engine number is required for the contract."),
  engineCapacity: z.string().min(2, "Engine capacity is required."),
  modelNumber: z.string().min(2, "Model number is required."),
  shahidiNumber: z.string().min(3, "NIDA or ID number is required."),
  dailyFee: z.coerce.number().min(1000, "Payment amount is too small."),
  paymentFrequency: z.enum(['Daily', 'Weekly', '10-Day']),
  contractStart: z.date({
    required_error: "Contract start date is required.",
  }),
  contractTermMonths: z.coerce.number().min(1, "Contract term is required."),
  guarantorName: z.string().min(2, "Guarantor's name is required."),
  guarantorPhone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Guarantor's phone number is required."),
  witnessName: z.string().min(2, "Witness's name is required."),
  witnessPhone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Witness's phone number is required."),
  notes: z.string().optional(),
});

export type RiderFormValues = Omit<Rider, 'id' | 'bikeId' | 'contractEnd' | 'active' | 'createdAt'> & { contractStart: Date, notes?: string };

interface RiderFormProps {
  rider?: Rider | null;
  initialEmail?: string;
  initialName?: string;
  bikes: BikeType[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

export function RiderForm({ rider, initialEmail, initialName, bikes, onSubmit, onCancel, className }: RiderFormProps) {
  const { t } = useLanguage();
  const form = useForm<z.infer<typeof riderFormSchema>>({
    resolver: zodResolver(riderFormSchema),
    mode: "onChange",
    defaultValues: rider
      ? { 
          ...rider, 
          contractStart: rider.contractStart ? (typeof rider.contractStart === 'string' ? parseISO(rider.contractStart) : (rider.contractStart as any).toDate?.() || new Date()) : new Date(),
          vehicleType: 'Bajaji',
          paymentFrequency: rider.paymentFrequency || 'Daily',
          contractTermMonths: rider.contractTermMonths || 18,
          chassisNumber: rider.chassisNumber || "",
          engineNumber: rider.engineNumber || "",
          engineCapacity: rider.engineCapacity || "",
          modelNumber: rider.modelNumber || "",
          guarantorName: rider.guarantorName || "",
          guarantorPhone: rider.guarantorPhone || "",
          witnessName: rider.witnessName || "",
          witnessPhone: rider.witnessPhone || "",
        }
      : {
          name: initialName || "",
          email: initialEmail || "",
          phone: "",
          vehicleType: "Bajaji",
          plateNumber: "",
          chassisNumber: "",
          engineNumber: "",
          engineCapacity: "",
          modelNumber: "",
          shahidiNumber: "",
          dailyFee: 25000,
          paymentFrequency: 'Daily',
          contractStart: new Date(),
          contractTermMonths: 18,
          guarantorName: "",
          guarantorPhone: "",
          witnessName: "",
          witnessPhone: "",
          notes: "",
        },
  });
  
  const { formState: { isValid } } = form;

  useEffect(() => {
    if (initialEmail) {
      form.setValue('email', initialEmail);
    }
    if (initialName) {
      form.setValue('name', initialName);
    }
  }, [initialEmail, initialName, form]);

  function handleFormSubmit(values: z.infer<typeof riderFormSchema>) {
    const bike = bikes.find(b => b.plateNumber.toLowerCase() === values.plateNumber.toLowerCase()) ?? bikes[0];
    const contractEnd = addMonths(values.contractStart, values.contractTermMonths);
    
    const submissionData = {
        ...values,
        contractStart: values.contractStart.toISOString(),
        bikeId: bike?.id || "bike-custom",
        contractEnd: contractEnd.toISOString()
    }
    onSubmit(submissionData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className={cn("space-y-6", className)}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="personal" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                <User size={14} className="mr-2" /> {t("fleet.form.tab.basic")}
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                <CarFront size={14} className="mr-2" /> {t("fleet.form.tab.bajaji")}
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                <Shield size={14} className="mr-2" /> {t("fleet.form.tab.legal")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 pt-4 text-left">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fleet.form.label.fullName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fleet.form.placeholder.name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fleet.form.label.email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={t("fleet.form.placeholder.email")} {...field} className="pl-9" readOnly={!!initialEmail} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fleet.form.label.phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fleet.form.placeholder.phone")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shahidiNumber"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>{t("fleet.form.label.idNumber")}</FormLabel>
                  <FormControl>
                      <Input placeholder={t("fleet.form.placeholder.idNumber")} {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>{t("fleet.form.label.vehicleType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder={t("fleet.form.placeholder.selectType")} />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="Bajaji">{t("fleet.form.select.bajaji")}</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plateNumber"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>{t("fleet.form.label.plateNumber")}</FormLabel>
                      <FormControl>
                          <Input placeholder={t("fleet.form.placeholder.plateNumber")} {...field} className="uppercase font-black"/>
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="modelNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("fleet.form.label.model")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.model")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="engineCapacity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("fleet.form.label.capacity")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.capacity")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fleet.form.label.chassisNo")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("fleet.form.placeholder.chassis")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fleet.form.label.engineNo")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("fleet.form.placeholder.engine")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fleet.form.label.dailyFee")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fleet.form.label.frequency")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("fleet.form.placeholder.frequency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">{t("fleet.form.select.daily")}</SelectItem>
                        <SelectItem value="Weekly">{t("fleet.form.select.weekly")}</SelectItem>
                        <SelectItem value="10-Day">{t("fleet.form.select.every10Days")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractStart"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("fleet.form.label.startDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd MMM yy") : t("fleet.form.placeholder.pickDate")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contractTermMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fleet.form.label.termMonths")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-muted-foreground">{t("fleet.form.section.guarantor")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="guarantorName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("fleet.form.label.guarantorName")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.guarantorName")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="guarantorPhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("common.phone")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.genericPhone")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-muted-foreground">{t("fleet.form.section.witness")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="witnessName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("fleet.form.label.witnessName")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.witnessName")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="witnessPhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("fleet.form.label.witnessPhone")}</FormLabel>
                        <FormControl>
                        <Input placeholder={t("fleet.form.placeholder.genericPhone")} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="uppercase font-bold text-xs tracking-widest">{t("common.cancel")}</Button>
            <Button
                type="submit"
                disabled={!isValid}
                className={cn(
                    "uppercase font-bold text-xs tracking-widest px-8 transition-all",
                    isValid ? "bg-accent text-white hover:bg-accent/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
            >
                {rider ? t("fleet.form.button.saveChanges") : t("fleet.form.button.confirmOnboarding")}
            </Button>
        </div>
      </form>
    </Form>
  );
}
