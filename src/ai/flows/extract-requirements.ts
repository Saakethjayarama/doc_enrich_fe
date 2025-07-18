'use server';
/**
 * @fileOverview Extracts functional and non-functional requirements from documents and audio files.
 *
 * - extractRequirements - A function that handles the requirement extraction process.
 * - ExtractRequirementsInput - The input type for the extractRequirements function.
 * - ExtractRequirementsOutput - The return type for the extractRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractRequirementsInputSchema = z.object({
  files: z.array(
    z.object({
      name: z.string().describe('The name of the file.'),
      dataUri: z
        .string()
        .describe(
          "The file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    })
  ).describe('An array of files to extract requirements from.'),
});
export type ExtractRequirementsInput = z.infer<typeof ExtractRequirementsInputSchema>;

const ClarificationNeededSchema = z.object({
  field: z.string().describe('The field that needs clarification.'),
  reason: z.string().describe('The reason why clarification is needed.'),
});

const ExtractRequirementsOutputSchema = z.object({
  functionalRequirements: z.array(z.string()).describe('A list of functional requirements extracted from the files.'),
  nonFunctionalRequirements: z.array(z.string()).describe('A list of non-functional requirements extracted from the files.'),
  clarificationNeeded: z.array(ClarificationNeededSchema).optional().describe('A list of fields that need clarification and the reason why.'),
});
export type ExtractRequirementsOutput = z.infer<typeof ExtractRequirementsOutputSchema>;

export async function extractRequirements(input: ExtractRequirementsInput): Promise<ExtractRequirementsOutput> {
  return extractRequirementsFlow(input);
}

const extractRequirementsPrompt = ai.definePrompt({
  name: 'extractRequirementsPrompt',
  input: {schema: ExtractRequirementsInputSchema},
  output: {schema: ExtractRequirementsOutputSchema},
  prompt: `You are a requirements engineer who extracts functional and non-functional requirements from various file types.

  Analyze the following files and extract both functional and non-functional requirements. If any requirement is ambiguous, indicate what clarification is needed.

  Files:
  {{#each files}}
    File Name: {{this.name}}
    File Content: {{media url=this.dataUri}}
  {{/each}}`,
});

const extractRequirementsFlow = ai.defineFlow(
  {
    name: 'extractRequirementsFlow',
    inputSchema: ExtractRequirementsInputSchema,
    outputSchema: ExtractRequirementsOutputSchema,
  },
  async input => {
    const {output} = await extractRequirementsPrompt(input);
    return output!;
  }
);
