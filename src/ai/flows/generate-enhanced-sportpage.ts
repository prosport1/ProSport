
'use server';

/**
 * @fileOverview Generates an enhanced sportpage for athletes on the Plus plan, styled like NFL/NBA presentations.
 *
 * - generateEnhancedSportpage - A function that generates the enhanced sportpage.
 * - GenerateEnhancedSportpageInput - The input type for the generateEnhancedSportpage function.
 * - GenerateEnhancedSportpageOutput - The return type for the generateEnhancedSportpage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEnhancedSportpageInputSchema = z.object({
  fullName: z.string().describe('The full name of the athlete.'),
  dateOfBirth: z.string().describe('The date of birth of the athlete.'),
  sport: z.string().describe('The sport the athlete participates in.'),
  isAmateur: z.boolean().describe('Whether the athlete is an amateur or professional.'),
  details: z.string().describe('Additional details about the athlete, such as weight class, martial arts ranking, etc.'),
  achievements: z.string().describe('The achievements of the athlete.'),
});
export type GenerateEnhancedSportpageInput = z.infer<typeof GenerateEnhancedSportpageInputSchema>;

const GenerateEnhancedSportpageOutputSchema = z.object({
  sportpageHtml: z.string().describe('The HTML content of the enhanced sportpage.'),
});
export type GenerateEnhancedSportpageOutput = z.infer<typeof GenerateEnhancedSportpageOutputSchema>;

export async function generateEnhancedSportpage(input: GenerateEnhancedSportpageInput): Promise<GenerateEnhancedSportpageOutput> {
  return generateEnhancedSportpageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEnhancedSportpagePrompt',
  output: {schema: GenerateEnhancedSportpageOutputSchema},
  prompt: `You are an expert web designer specializing in creating engaging sportpages for athletes, styled after professional sports leagues like the NFL and NBA.

  Based on the athlete's data, generate a visually appealing and informative sportpage.

  You MUST create an HTML structure that includes an <img> tag. For the 'src' attribute of this <img> tag, you MUST use the exact placeholder string "__IMAGE_PLACEHOLDER__". The application will replace this placeholder with the actual athlete's photo.

  The sportpage should include:
  - A professional-looking header with the athlete's name and sport.
  - Key details about the athlete: date of birth, sport, amateur/professional status, achievements, and other relevant details.
  - Modern fonts and a dynamic layout.
  - Ensure the design reflects the high-energy and professional aesthetic of the NFL/NBA.

  Return ONLY the HTML for the content inside the <body> tag. The output should start with a <div...> and end with a </div>.
  It will be embedded in an existing page. Do NOT include <!DOCTYPE html>, <html>, <head>, or <body> tags.
  Use Tailwind CSS classes for styling.

  Athlete Information:
  - Full Name: {{{fullName}}}
  - Date of Birth: {{{dateOfBirth}}}
  - Sport: {{{sport}}}
  - Amateur/Professional: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
  - Achievements: {{{achievements}}}
  - Details: {{{details}}}
`,
});


const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
    outputSchema: GenerateEnhancedSportpageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
