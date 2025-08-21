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
  photoDataUri: z
    .string()
    .describe(
      "A photo of the athlete, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  input: {schema: GenerateEnhancedSportpageInputSchema},
  output: {schema: GenerateEnhancedSportpageOutputSchema},
  prompt: `You are an expert web designer specializing in creating engaging sportpages for athletes, styled after professional sports leagues like the NFL and NBA.

  Using the athlete's information, create a visually appealing and informative sportpage to attract potential sponsors and fans.

  The sportpage should include:
  - A professional-looking header with the athlete's name and sport.
  - A compelling hero section with the athlete's photo.  Make sure to reference the photo using: {{media url=photoDataUri}}
  - Key details about the athlete, including date of birth, sport, amateur/professional status, and other relevant details.
  - Modern fonts and a dynamic layout.
  - Ensure the design reflects the high-energy and professional aesthetic of the NFL/NBA.

  Athlete Information:
  - Full Name: {{{fullName}}}
  - Date of Birth: {{{dateOfBirth}}}
  - Sport: {{{sport}}}
  - Amateur/Professional: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
  - Details: {{{details}}}

  Return the complete HTML code for the sportpage.
  `,
});

const generateEnhancedSportpageFlow = ai.defineFlow(
  {
    name: 'generateEnhancedSportpageFlow',
    inputSchema: GenerateEnhancedSportpageInputSchema,
    outputSchema: GenerateEnhancedSportpageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
