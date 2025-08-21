'use server';

/**
 * @fileOverview A flow to generate a sponsor presentation for athletes.
 *
 * - generateSponsorPresentation - A function that generates a sponsor presentation.
 * - GenerateSponsorPresentationInput - The input type for the generateSponsorPresentation function.
 * - GenerateSponsorPresentationOutput - The return type for the generateSponsorPresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSponsorPresentationInputSchema = z.object({
  fullName: z.string().describe('The full name of the athlete.'),
  dateOfBirth: z.string().describe('The date of birth of the athlete.'),
  sport: z.string().describe('The sport the athlete participates in.'),
  isAmateur: z.boolean().describe('Whether the athlete is an amateur or professional.'),
  weightCategory: z.string().optional().describe('The weight category of the athlete, if applicable.'),
  martialArtsRanking: z.string().optional().describe('The ranking/graduation of the athlete in martial arts, if applicable.'),
  achievements: z.string().describe('The achievements of the athlete.'),
  stats: z.string().describe('The statistics of the athlete.'),
});
export type GenerateSponsorPresentationInput = z.infer<typeof GenerateSponsorPresentationInputSchema>;

const GenerateSponsorPresentationOutputSchema = z.object({
  presentation: z.string().describe('The generated sponsor presentation.'),
});
export type GenerateSponsorPresentationOutput = z.infer<typeof GenerateSponsorPresentationOutputSchema>;

export async function generateSponsorPresentation(input: GenerateSponsorPresentationInput): Promise<GenerateSponsorPresentationOutput> {
  return generateSponsorPresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSponsorPresentationPrompt',
  input: {schema: GenerateSponsorPresentationInputSchema},
  output: {schema: GenerateSponsorPresentationOutputSchema},
  prompt: `You are an AI assistant specialized in creating presentations for athletes to attract potential sponsors.

  Based on the athlete's data, generate a compelling presentation highlighting their achievements, stats, and potential.
  Use a modern style inspired by NFL presentations.

  Athlete Data:
  Full Name: {{{fullName}}}
  Date of Birth: {{{dateOfBirth}}}
  Sport: {{{sport}}}
  Amateur/Professional: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
  {{#if weightCategory}}Weight Category: {{{weightCategory}}}{{/if}}
  {{#if martialArtsRanking}}Martial Arts Ranking: {{{martialArtsRanking}}}{{/if}}
  Achievements: {{{achievements}}}
  Stats: {{{stats}}}

  Presentation:`,
});

const generateSponsorPresentationFlow = ai.defineFlow(
  {
    name: 'generateSponsorPresentationFlow',
    inputSchema: GenerateSponsorPresentationInputSchema,
    outputSchema: GenerateSponsorPresentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
