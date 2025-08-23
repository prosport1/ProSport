
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
  achievements: z.string().describe('The achievements of the athlete.'),
  details: z.string().describe('Additional details about the athlete, such as weight class, martial arts ranking, etc.'),
});
export type GenerateSponsorPresentationInput = z.infer<typeof GenerateSponsorPresentationInputSchema>;

const GenerateSponsorPresentationOutputSchema = z.object({
  presentation: z.string().describe('The generated sponsor presentation in Markdown format.'),
});
export type GenerateSponsorPresentationOutput = z.infer<typeof GenerateSponsorPresentationOutputSchema>;

export async function generateSponsorPresentation(input: GenerateSponsorPresentationInput): Promise<GenerateSponsorPresentationOutput> {
  return generateSponsorPresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSponsorPresentationPrompt',
  input: {schema: GenerateSponsorPresentationInputSchema},
  output: {schema: GenerateSponsorPresentationOutputSchema},
  prompt: `
You are an AI assistant specialized in creating presentations for athletes to attract potential sponsors.
Your output MUST be in Markdown format.

Generate a compelling presentation based on the athlete's data.
The presentation should be modern and professional, inspired by sports league styles.
Create a "Statistics" section with plausible metrics relevant to the sport, derived from the "Details" and "Achievements" sections.

Athlete Data:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Amateur/Professional: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Achievements: {{{achievements}}}
- Details: {{{details}}}

Use this structure for the output:
# Sponsor Presentation: {{{fullName}}}

## Overview
- **Sport:** {{{sport}}}
- **Status:** {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- **Born:** {{{dateOfBirth}}}

## Statistics
*Based on the details provided.*
- Height: (e.g., 1.80m)
- Weight: (e.g., 77kg)
- Record: (e.g., 10 Wins, 2 Losses)
- Other relevant stats...

## Achievements
{{{achievements}}}

## About
{{{details}}}
`,
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
