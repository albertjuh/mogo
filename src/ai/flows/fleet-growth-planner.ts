'use server';
/**
 * @fileOverview A Genkit flow for generating a strategic fleet growth plan for BodaEmpire owners.
 *
 * - fleetGrowthPlanner - A function that handles the fleet growth planning process.
 * - FleetGrowthPlannerInput - The input type for the fleetGrowthPlanner function.
 * - FleetGrowthPlannerOutput - The return type for the fleetGrowthPlanner function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FleetGrowthPlannerInputSchema = z.object({
  currentFleetSize: z
    .number()
    .int()
    .positive()
    .describe('The current number of bodas (motorcycle taxis) in the fleet.'),
  desiredFleetSize: z
    .number()
    .int()
    .positive()
    .describe('The target number of bodas the owner wishes to achieve.'),
  availableSavings: z
    .number()
    .positive()
    .describe('The amount of money currently available for investment in growing the fleet.'),
});
export type FleetGrowthPlannerInput = z.infer<typeof FleetGrowthPlannerInputSchema>;

const FleetGrowthPlannerOutputSchema = z.object({
  timeToAchieveGoalMonths: z
    .number()
    .int()
    .positive()
    .describe('Estimated time in months to reach the desired fleet size.'),
  totalInvestmentNeeded: z
    .number()
    .positive()
    .describe('Total estimated investment (in local currency units) required to reach the desired fleet size.'),
  optimalSuggestions: z
    .array(z.string())
    .describe('Optimal suggestions and strategies for adding bodas over time.'),
  growthTips: z.array(z.string()).describe('Personalized tips for improving overall fleet growth and operational efficiency.'),
});
export type FleetGrowthPlannerOutput = z.infer<typeof FleetGrowthPlannerOutputSchema>;

export async function fleetGrowthPlanner(
  input: FleetGrowthPlannerInput
): Promise<FleetGrowthPlannerOutput> {
  return fleetGrowthPlannerFlow(input);
}

const fleetGrowthPlannerPrompt = ai.definePrompt({
  name: 'fleetGrowthPlannerPrompt',
  input: { schema: FleetGrowthPlannerInputSchema },
  output: { schema: FleetGrowthPlannerOutputSchema },
  prompt: `You are a strategic business advisor and financial planner for BodaEmpire, a motorcycle taxi business.
Your goal is to help a BodaEmpire owner plan for fleet growth by analyzing their current situation and providing actionable advice.

Here are the current metrics for the BodaEmpire owner:
- Current Fleet Size: {{{currentFleetSize}}} bodas
- Desired Fleet Size: {{{desiredFleetSize}}} bodas
- Available Savings for Investment: {{{availableSavings}}} local currency units

Based on these inputs, generate a strategic plan that includes:
1.  An estimated time in months to achieve the desired fleet size.
2.  The total estimated investment needed (in local currency units) to reach the desired fleet size.
3.  Optimal suggestions for adding bodas over time, considering the available savings and the goal.
4.  Personalized tips for improving overall fleet growth, efficiency, and sustainability.

Assume that each additional boda requires an average investment of approximately 2000 local currency units (including purchase and initial setup costs) and generates a net profit that can contribute to further growth. Be realistic in your estimations and suggestions.

Provide the output in a structured JSON format matching the defined output schema.`,
});

const fleetGrowthPlannerFlow = ai.defineFlow(
  {
    name: 'fleetGrowthPlannerFlow',
    inputSchema: FleetGrowthPlannerInputSchema,
    outputSchema: FleetGrowthPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await fleetGrowthPlannerPrompt(input);
    return output!;
  }
);
