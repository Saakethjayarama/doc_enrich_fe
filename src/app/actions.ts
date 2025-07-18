
'use server';

import { extractRequirements, ExtractRequirementsInput, ExtractRequirementsOutput } from '@/ai/flows/extract-requirements';
import { suggestClarifications, SuggestClarificationsInput, SuggestClarificationsOutput } from '@/ai/flows/suggest-clarifications';
import { z } from 'zod';

export type RefineResult = ExtractRequirementsOutput & { error?: string };
export type SuggestResult = SuggestClarificationsOutput & { error?: string };

const dataUriSchema = z.string().refine(val => val.startsWith('data:'), {
  message: 'Data URI must start with "data:"',
});

const fileSchema = z.object({
  name: z.string(),
  dataUri: dataUriSchema,
});

const refineInputSchema = z.object({
  files: z.array(fileSchema),
});

export async function refineRequirementsAction(
  input: ExtractRequirementsInput
): Promise<RefineResult> {
  try {
    const validatedInput = refineInputSchema.parse(input);
    const result = await extractRequirements(validatedInput);
    return result;
  } catch (e) {
    console.error("Error in refineRequirementsAction:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { 
      error: `Failed to process requirements. ${errorMessage}`,
      functionalRequirements: [],
      nonFunctionalRequirements: [],
    };
  }
}

const suggestInputSchema = z.object({
    requirements: z.string(),
});

export async function suggestClarificationAction(
  input: SuggestClarificationsInput
): Promise<SuggestResult> {
  try {
    const validatedInput = suggestInputSchema.parse(input);
    const result = await suggestClarifications(validatedInput);
    return result;
  } catch (e) {
    console.error("Error in suggestClarificationAction:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
        error: `Failed to suggest clarifications. ${errorMessage}`,
        clarificationSuggestions: [],
    };
  }
}
