
'use server';
/**
 * @fileOverview A flow to generate an enhanced, visually appealing sportpage for an athlete.
 * 
 * This flow takes athlete data and generates an HTML page with a professional,
 * modern design inspired by major sports leagues (NFL, NBA).
 *
 * - generateEnhancedSportpage - A function that handles the sportpage generation.
 * - GenerateEnhancedSportpageInput - The input type for the function.
 * - GenerateEnhancedSportpageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the athlete's data, excluding the photo.
export const GenerateEnhancedSportpageInputSchema = z.object({
    fullName: z.string().describe("The full name of the athlete."),
    dateOfBirth: z.string().describe("The date of birth of the athlete in DD/MM/YYYY format."),
    sport: z.string().describe("The primary sport of the athlete."),
    isAmateur: z.boolean().describe("True if the athlete is amateur, false if professional."),
    details: z.string().describe("A comma-separated list of key details (e.g., Weight Class, Rank, Team)."),
    achievements: z.string().describe("A comma-separated list of significant achievements."),
});
export type GenerateEnhancedSportpageInput = z.infer<typeof GenerateEnhancedSportpageInputSchema>;

// Output schema expects a single string of HTML content.
const GenerateEnhancedSportpageOutputSchema = z.object({
    sportpageHtml: z.string().describe("The full HTML content for the sportpage, as a single string."),
});
export type GenerateEnhancedSportpageOutput = z.infer<typeof GenerateEnhancedSportpageOutputSchema>;


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
Your task is to generate a complete, single-file HTML page using Tailwind CSS for styling.
The design should be modern, clean, and impressive, inspired by official NFL or NBA player profile pages.
The entire output must be a single HTML string.

You MUST use the placeholder "__IMAGE_PLACEHOLDER__" for the 'src' attribute of the main athlete image tag. Do NOT use any other placeholder.

Use the following data to populate the HTML:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Status: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Details: {{{details}}}
- Achievements: {{{achievements}}}

The final HTML should be a complete document starting with <!DOCTYPE html> and including <head> and <body> tags.
Inside the <head>, you must include a script tag to load Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>.
Do not use any other external libraries or scripts.
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
