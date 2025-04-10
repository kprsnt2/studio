'use server';
/**
 * @fileOverview An argument analysis AI agent.
 *
 * - analyzeArgumentWeaknesses - A function that analyzes arguments to identify weaknesses.
 * - AnalyzeArgumentWeaknessesInput - The input type for the analyzeArgumentWeaknesses function.
 * - AnalyzeArgumentWeaknessesOutput - The return type for the analyzeArgumentWeaknesses function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeArgumentWeaknessesInputSchema = z.object({
  argument: z.string().describe('The argument to analyze.'),
  topic: z.string().describe('The debate topic.'),
  side: z.enum(['pro', 'con']).describe('The side of the argument (pro or con).'),
});
export type AnalyzeArgumentWeaknessesInput = z.infer<typeof AnalyzeArgumentWeaknessesInputSchema>;

const AnalyzeArgumentWeaknessesOutputSchema = z.object({
  weaknesses: z.array(z.string()).describe('The weaknesses of the argument.'),
  rebuttals: z.array(z.string()).describe('Possible rebuttals to the argument.'),
});
export type AnalyzeArgumentWeaknessesOutput = z.infer<typeof AnalyzeArgumentWeaknessesOutputSchema>;

export async function analyzeArgumentWeaknesses(
  input: AnalyzeArgumentWeaknessesInput
): Promise<AnalyzeArgumentWeaknessesOutput> {
  return analyzeArgumentWeaknessesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeArgumentWeaknessesPrompt',
  input: {
    schema: z.object({
      argument: z.string().describe('The argument to analyze.'),
      topic: z.string().describe('The debate topic.'),
      side: z.string().describe('The side of the argument (pro or con).'),
    }),
  },
  output: {
    schema: z.object({
      weaknesses: z.array(z.string()).describe('The weaknesses of the argument.'),
      rebuttals: z.array(z.string()).describe('Possible rebuttals to the argument.'),
    }),
  },
  prompt: `You are an expert debate analyst. Your job is to analyze the provided argument for weaknesses and suggest possible rebuttals.

  Topic: {{{topic}}}
  Side: {{{side}}}
  Argument: {{{argument}}}

  Identify the weaknesses in the argument and provide possible rebuttals.
  Weaknesses:
  Rebuttals:`,
});

const analyzeArgumentWeaknessesFlow = ai.defineFlow<
  typeof AnalyzeArgumentWeaknessesInputSchema,
  typeof AnalyzeArgumentWeaknessesOutputSchema
>({
  name: 'analyzeArgumentWeaknessesFlow',
  inputSchema: AnalyzeArgumentWeaknessesInputSchema,
  outputSchema: AnalyzeArgumentWeaknessesOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
