'use server';
/**
 * @fileOverview A Genkit flow for generating a concise summary with key insights and actionable recommendations from weekly/monthly financial and operational reports.
 *
 * - reportInsightsGenerator - A function that handles the report analysis process.
 * - ReportInsightsGeneratorInput - The input type for the reportInsightsGenerator function.
 * - ReportInsightsGeneratorOutput - The return type for the reportInsightsGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportInsightsGeneratorInputSchema = z.object({
  financialReport: z
    .string()
    .describe('The detailed financial report data for the period.'),
  operationalReport: z
    .string()
    .describe('The detailed operational report data for the period.'),
});
export type ReportInsightsGeneratorInput = z.infer<
  typeof ReportInsightsGeneratorInputSchema
>;

const ReportInsightsGeneratorOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the overall business performance.'),
  keyInsights: z
    .array(z.string())
    .describe('A list of key insights derived from the reports.'),
  recommendations: z
    .array(z.string())
    .describe(
      'A list of actionable recommendations to improve efficiency, profitability, and fleet growth.'
    ),
});
export type ReportInsightsGeneratorOutput = z.infer<
  typeof ReportInsightsGeneratorOutputSchema
>;

export async function reportInsightsGenerator(
  input: ReportInsightsGeneratorInput
): Promise<ReportInsightsGeneratorOutput> {
  return reportInsightsGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportInsightsGeneratorPrompt',
  input: {schema: ReportInsightsGeneratorInputSchema},
  output: {schema: ReportInsightsGeneratorOutputSchema},
  prompt: `You are an expert business analyst specializing in micro-transportation businesses like BodaEmpire. Your task is to analyze the provided financial and operational reports. Generate a concise summary, identify key insights, and provide actionable recommendations to improve business performance and fleet growth.

---
**Financial Report:**
{{{financialReport}}}

---
**Operational Report:**
{{{operationalReport}}}

---
**Instructions:**
1. Provide a single paragraph summary of the overall business performance.
2. List 3-5 key insights derived from the data, highlighting both positive aspects and areas of concern.
3. Provide 3-5 actionable recommendations to improve efficiency, profitability, and support fleet growth.
`,
});

const reportInsightsGeneratorFlow = ai.defineFlow(
  {
    name: 'reportInsightsGeneratorFlow',
    inputSchema: ReportInsightsGeneratorInputSchema,
    outputSchema: ReportInsightsGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
