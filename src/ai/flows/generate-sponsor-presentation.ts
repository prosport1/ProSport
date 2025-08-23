
'use server';

/**
 * @fileOverview A flow to generate a sponsor presentation for athletes.
 *
 * - generateSponsorPresentation - A function that generates a sponsor presentation.
 */

import {ai} from '@/ai/genkit';
import { GenerateSponsorPresentationInputSchema, GenerateSponsorPresentationOutputSchema, type GenerateSponsorPresentationInput, type GenerateSponsorPresentationOutput } from './types';

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
