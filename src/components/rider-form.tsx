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

const riderFormSchema = z.object({
  name: z.string().min(2, "Jina kamili linahitajika."),
  email: z.string().email("Barua pepe sahihi inahitajika."),
  phone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Namba ya simu ya Tanzania inahitajika."),
  vehicleType: z.literal('Bajaji'),
  plateNumber: z.string().min(3, "Namba ya usajili inahitajika."),
  chassisNumber: z.string().min(5, "Chassis number inahitajika kwa mkataba."),
  engineNumber: z.string().min(5, "Engine number inahitajika kwa mkataba."),
  engineCapacity: z.string().min(2, "Engine capacity inahitajika."),
  modelNumber: z.string().min(2, "Model number inahitajika."),
  shahidiNumber: z.string().min(3, "Namba ya NIDA au kitambulisho inahitajika."),
  dailyFee: z.coerce.number().min(1000, "Kiasi cha malipo ni kidogo sana."),
  paymentFrequency: z.enum(['Daily', 'Weekly', '10-Day']),
  contractStart: z.date({
    required_error: "Tarehe ya kuanza mkataba inahitajika.",
  }),
  contractTermMonths: z.coerce.number().min(1, "Muda wa mkataba unahitajika."),
  guarantorName: z.string().min(2, "Jina la mdhamini linahitajika."),
  guarantorPhone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Namba ya mdhamini inahitajika."),
  witnessName: z.string().min(2, "Jina la shahidi linahitajika."),
  witnessPhone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Namba ya shahidi inahitajika."),
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
                <User size={14} className="mr-2" /> Basic
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                <CarFront size={14} className="mr-2" /> Bajaji
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                <Shield size={14} className="mr-2" /> Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 pt-4 text-left">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Jina la Mpangaji)</FormLabel>
                  <FormControl>
                    <Input placeholder="Juma Hassan" {...field} />
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
                  <FormLabel>Email Address (Barua Pepe)</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="rider@email.com" {...field} className="pl-9" readOnly={!!initialEmail} />
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
                  <FormLabel>Phone (Namba ya Simu)</FormLabel>
                  <FormControl>
                    <Input placeholder="0712345678" {...field} />
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
                  <FormLabel>ID / Shahidi Number</FormLabel>
                  <FormControl>
                      <Input placeholder="NIDA / Voter ID" {...field} />
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
                      <FormLabel>Vehicle Type (Chombo)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="Bajaji">Bajaji</SelectItem>
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
                      <FormLabel>Plate Number (Usajili)</FormLabel>
                      <FormControl>
                          <Input placeholder="T 123 BCD" {...field} className="uppercase font-black"/>
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
                        <FormLabel>Model / Type</FormLabel>
                        <FormControl>
                        <Input placeholder="Boxer 150" {...field} />
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
                        <FormLabel>Capacity (CC)</FormLabel>
                        <FormControl>
                        <Input placeholder="150cc" {...field} />
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
                    <FormLabel>Chassis No.</FormLabel>
                    <FormControl>
                      <Input placeholder="MC..." {...field} />
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
                    <FormLabel>Engine No.</FormLabel>
                    <FormControl>
                      <Input placeholder="ENG..." {...field} />
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
                    <FormLabel>Daily Fee (TZS)</FormLabel>
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
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="10-Day">Every 10 Days</SelectItem>
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
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd MMM yy") : "Pick"}
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
                    <FormLabel>Term (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-muted-foreground">Guarantor (Mdhamini)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="guarantorName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Mdhamini Name" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                        <Input placeholder="07..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-muted-foreground">Witness (Shahidi)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="witnessName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Witness Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Jina la Shahidi" {...field} />
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
                        <FormLabel>Witness Phone</FormLabel>
                        <FormControl>
                        <Input placeholder="07..." {...field} />
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
            <Button type="button" variant="outline" onClick={onCancel} className="uppercase font-bold text-xs tracking-widest">Cancel</Button>
            <Button 
                type="submit" 
                disabled={!isValid}
                className={cn(
                    "uppercase font-bold text-xs tracking-widest px-8 transition-all",
                    isValid ? "bg-accent text-white hover:bg-accent/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
            >
                {rider ? "Save Changes" : "Confirm Onboarding"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
