
'use server';
/**
 * @fileOverview A flow to generate an enhanced, visually appealing sportpage for an athlete.
 * 
 * This flow takes athlete data and generates an HTML page with a professional,
 * modern design inspired by major sports leagues (NFL, NBA).
 *
 * - generateEnhancedSportpage - A function that handles the sportpage generation.
 */

import {ai} from '@/ai/genkit';
import { GenerateEnhancedSportpageInputSchema, GenerateEnhancedSportpageOutputSchema, type GenerateEnhancedSportpageInput, type GenerateEnhancedSportpageOutput } from './types';


/**
 * Generates an enhanced sportpage by calling the Genkit flow.
 * @param input The athlete's data.
 * @returns The generated HTML for the sportpage.
 */
export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<GenerateEnhancedSportpageOutput> {
  return generateEnhancedSportpageFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateEnhancedSportpagePrompt',
    input: { schema: GenerateEnhancedSportpageInputSchema },
    output: { schema: GenerateEnhancedSportpageOutputSchema },
    prompt: `
You are an expert web designer specializing in Tailwind CSS.
Your task is to generate the HTML for a professional athlete profile page.

Instructions:
1.  Generate ONLY the HTML content for the <body> tag.
2.  Do NOT include <!DOCTYPE html>, <html>, <head>, <body>, or <script> tags.
3.  The 'src' attribute for the main athlete image MUST be exactly "__IMAGE_PLACEHOLDER__". Do not use any other placeholder.

Use the following data to create the page:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Status: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Details: {{{details}}}
- Achievements: {{{achievements}}}
`,
});

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
    outputSchema: GenerateEnhancedSportpageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
