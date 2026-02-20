"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fleetGrowthPlanner, FleetGrowthPlannerOutput } from "@/ai/flows/fleet-growth-planner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  currentFleetSize: z.coerce.number().int().min(1, "Must have at least 1 boda."),
  desiredFleetSize: z.coerce.number().int().min(2, "Desired size must be greater than current."),
  availableSavings: z.coerce.number().min(0, "Savings cannot be negative."),
}).refine(data => data.desiredFleetSize > data.currentFleetSize, {
    message: "Desired fleet size must be greater than current size.",
    path: ["desiredFleetSize"],
});

export default function GrowthPage() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<FleetGrowthPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentFleetSize: 3,
      desiredFleetSize: 10,
      availableSavings: 5000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPlan(null);
    try {
      const result = await fleetGrowthPlanner(values);
      setPlan(result);
    } catch (error) {
      console.error("Error generating growth plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a plan. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const currentValues = form.watch();
  const progressValue = currentValues.desiredFleetSize > 0 
    ? (currentValues.currentFleetSize / currentValues.desiredFleetSize) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Fleet Growth Planner</h1>
        <p className="text-muted-foreground">Use AI to plan your BodaEmpire expansion.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Goal</CardTitle>
          <CardDescription>Enter your current stats and future goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentFleetSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Fleet</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredFleetSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Fleet</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Progress value={progressValue} className="w-full" />
              <FormField
                control={form.control}
                name="availableSavings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Savings (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    Generate Growth Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {plan && (
        <Card className="animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle className="font-headline">Your AI-Generated Growth Plan</CardTitle>
                <CardDescription>A strategic path to reach your goal of {currentValues.desiredFleetSize} bodas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-secondary-foreground font-medium">Time to Goal</p>
                        <p className="text-2xl font-bold text-accent">{plan.timeToAchieveGoalMonths} months</p>
                    </div>
                     <div className="p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-secondary-foreground font-medium">Total Investment</p>
                        <p className="text-2xl font-bold text-accent">KES {plan.totalInvestmentNeeded.toLocaleString()}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Optimal Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                       {plan.optimalSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Growth Tips</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        {plan.growthTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
