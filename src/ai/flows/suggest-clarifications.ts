// src/ai/flows/suggest-clarifications.ts
'use server';

/**
 * @fileOverview A flow to suggest clarifications for ambiguous requirements.
 *
 * - suggestClarifications - A function that suggests clarifications for ambiguous requirements.
 * - SuggestClarificationsInput - The input type for the suggestClarifications function.
 * - SuggestClarificationsOutput - The return type for the suggestClarifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestClarificationsInputSchema = z.object({
  requirements: z
    .string()
    .describe('The ambiguous requirements to clarify.'),
});
export type SuggestClarificationsInput = z.infer<typeof SuggestClarificationsInputSchema>;

const SuggestClarificationsOutputSchema = z.object({
  clarificationSuggestions: z
    .array(z.string())
    .describe('A list of suggested clarifications for the requirements.'),
});
export type SuggestClarificationsOutput = z.infer<typeof SuggestClarificationsOutputSchema>;

export async function suggestClarifications(input: SuggestClarificationsInput): Promise<SuggestClarificationsOutput> {
  return suggestClarificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestClarificationsPrompt',
  input: {schema: SuggestClarificationsInputSchema},
  output: {schema: SuggestClarificationsOutputSchema},
  prompt: `You are a requirement refinement expert. Given the following ambiguous requirements, suggest a list of clarifications that would make the requirements more specific and actionable. Return a numbered list of suggestions. 

Requirements: {{{requirements}}}`,
});

const suggestClarificationsFlow = ai.defineFlow(
  {
    name: 'suggestClarificationsFlow',
    inputSchema: SuggestClarificationsInputSchema,
    outputSchema: SuggestClarificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
