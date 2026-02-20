"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import type { Rider, Bike } from "@/lib/types";
import { parseISO, addDays } from "date-fns";
import { Textarea } from "./ui/textarea";

const riderFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^(?:\+255|0)\d{9}$/, "Please enter a valid Tanzanian phone number."),
  plateNumber: z.string().min(3, "Plate number is required."),
  shahidiNumber: z.string().min(3, "Shahidi number is required."),
  dailyFee: z.coerce.number().min(1000, "Daily fee seems too low."),
  contractStart: z.date({
    required_error: "A contract start date is required.",
  }),
  notes: z.string().optional(),
});

export type RiderFormValues = Omit<Rider, 'id' | 'bikeId' | 'contractEnd' | 'active' | 'createdAt'> & { contractStart: Date, notes?: string };

interface RiderFormProps {
  rider?: Rider | null;
  bikes: Bike[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

export function RiderForm({ rider, bikes, onSubmit, onCancel, className }: RiderFormProps) {
  const form = useForm<z.infer<typeof riderFormSchema>>({
    resolver: zodResolver(riderFormSchema),
    defaultValues: rider
      ? { ...rider, contractStart: parseISO(rider.contractStart) }
      : {
          name: "",
          phone: "",
          plateNumber: "",
          shahidiNumber: "",
          dailyFee: 10000,
          contractStart: new Date(),
          notes: "",
        },
  });
  
  function handleFormSubmit(values: z.infer<typeof riderFormSchema>) {
    const bike = bikes.find(b => b.plateNumber.toLowerCase() === values.plateNumber.toLowerCase()) ?? bikes[0];
    const contractEnd = addDays(values.contractStart, 510);
    
    const submissionData = {
        ...values,
        bikeId: bike.id,
        contractEnd: contractEnd.toISOString()
    }
    onSubmit(submissionData);
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Juma Hassan" {...field} />
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+255 712 345 678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="plateNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Plate Number</FormLabel>
                <FormControl>
                    <Input placeholder="T 123 BCD" {...field} className="uppercase"/>
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
                <FormLabel>Shahidi No.</FormLabel>
                <FormControl>
                    <Input placeholder="ID Number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="contractStart"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Contract Start</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
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
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any extra info..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-[#0d1117] text-[#f5c842] hover:bg-[#0d1117]/90">{rider ? "Save Changes" : "Save Rider"}</Button>
        </div>
      </form>
    </Form>
  );
}
