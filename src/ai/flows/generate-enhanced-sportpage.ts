
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
You are an expert web designer AI specializing in creating stunning, professional athlete profile pages.
Your task is to generate the INNER HTML content for a <body> tag using Tailwind CSS for styling.
The design should be modern, clean, and impressive, inspired by official NFL or NBA player profile pages.

- DO NOT include <!DOCTYPE html>, <html>, <head>, or <body> tags.
- DO NOT include the <script src="https://cdn.tailwindcss.com"></script> tag.
- You MUST use the placeholder "__IMAGE_PLACEHOLDER__" for the 'src' attribute of the main athlete image tag. Do NOT use any other placeholder.

Use the following data to populate the HTML:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Status: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Details: {{{details}}}
- Achievements: {{{achievements}}}

Generate only the HTML content that would appear inside the <body> tag.
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
