import {z} from 'genkit';

// Input schema for the athlete's data for the sponsor presentation.
export const GenerateSponsorPresentationInputSchema = z.object({
  fullName: z.string().describe('The full name of the athlete.'),
  dateOfBirth: z.string().describe('The date of birth of the athlete.'),
  sport: z.string().describe('The sport the athlete participates in.'),
  isAmateur: z.boolean().describe('Whether the athlete is an amateur or professional.'),
  achievements: z.string().describe('The achievements of the athlete.'),
  details: z.string().describe('Additional details about the athlete, such as weight class, martial arts ranking, etc.'),
});
export type GenerateSponsorPresentationInput = z.infer<typeof GenerateSponsorPresentationInputSchema>;

// Output schema for the sponsor presentation.
export const GenerateSponsorPresentationOutputSchema = z.object({
  presentation: z.string().describe('The generated sponsor presentation in Markdown format.'),
});
export type GenerateSponsorPresentationOutput = z.infer<typeof GenerateSponsorPresentationOutputSchema>;


// Input schema for the athlete's data for the enhanced sportpage.
export const GenerateEnhancedSportpageInputSchema = z.object({
    fullName: z.string().describe("The full name of the athlete."),
    dateOfBirth: z.string().describe("The date of birth of the athlete in DD/MM/YYYY format."),
    sport: z.string().describe("The primary sport of the athlete."),
    isAmateur: z.boolean().describe("True if the athlete is amateur, false if professional."),
    details: z.string().describe("A comma-separated list of key details (e.g., Weight Class, Rank, Team)."),
    achievements: z.string().describe("A comma-separated list of significant achievements."),
    youtubeLink: z.string().optional().describe("An optional link to a YouTube video showcase."),
});
export type GenerateEnhancedSportpageInput = z.infer<typeof GenerateEnhancedSportpageInputSchema>;

// Output schema for the enhanced sportpage.
export const GenerateEnhancedSportpageOutputSchema = z.string().describe("The full HTML content for the sportpage, as a single string.");
export type GenerateEnhancedSportpageOutput = z.infer<typeof GenerateEnhancedSportpageOutputSchema>;
