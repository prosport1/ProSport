
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
Your task is to generate a compelling presentation in Markdown format based on the athlete's data.
The presentation must be professional and visually clean.
You must create a "Statistics" section. In this section, invent plausible metrics relevant to the sport, deriving them from the provided "Details" and "Achievements".

Use the following data:
- Full Name: {{{fullName}}}
- Date of Birth: {{{dateOfBirth}}}
- Sport: {{{sport}}}
- Status: {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- Achievements List: {{{achievements}}}
- Athlete Details: {{{details}}}

Structure your response EXACTLY as follows, using the data provided:

# Sponsor Presentation: {{{fullName}}}

## Overview
- **Sport:** {{{sport}}}
- **Status:** {{#if isAmateur}}Amateur{{else}}Professional{{/if}}
- **Born:** {{{dateOfBirth}}}

## Statistics
- *Invent plausible metrics based on the details and achievements provided. For example: Height, Weight, Record, etc.*

## Achievements
- *List the achievements here.*

## About
- *Provide the athlete's details here.*
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
