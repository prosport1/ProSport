
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
  input: {schema: GenerateEnhancedSportpageInputSchema},
  output: {schema: GenerateEnhancedSportpageOutputSchema},
  prompt: `You are an expert web designer specializing in creating engaging sportpages for athletes, styled after professional sports leagues like the NFL and NBA.

  Using the athlete's information, create a visually appealing and informative sportpage.

  You MUST create an HTML structure that includes an <img> tag. For the 'src' attribute of this <img> tag, you MUST use the exact placeholder string "__IMAGE_PLACEHOLDER__". The application will replace this placeholder with the actual athlete's photo.

  The sportpage should include:
  - A professional-looking header with the athlete's name and sport.
  - An <img> tag with src="__IMAGE_PLACEHOLDER__".
  - Key details about the athlete, including date of birth, sport, amateur/professional status, achievements, and other relevant details.
  - Modern fonts and a dynamic layout.
  - Ensure the design reflects the high-energy and professional aesthetic of the NFL/NBA.

  Return ONLY the HTML for the content inside the <body> tag. The output should start with a <div...> and end with a </div>.
  It will be embedded in an existing page. Do NOT include <!DOCTYPE html>, <html>, <head>, or <body> tags.
  Use Tailwind CSS classes for styling.

  Here is an example structure.
  \`\`\`html
  <div class="font-sans bg-[#1a1a1a] text-[#f1f1f1] p-4">
    <div class="container mx-auto p-4 max-w-4xl">
      <header class="text-center mb-8 border-b-4 border-yellow-400 pb-4">
        <h1 class="font-black text-7xl tracking-wider text-white uppercase" style="font-family: 'Teko', sans-serif;">{{fullName}}</h1>
        <p class="text-2xl text-gray-300">{{sport}}</p>
      </header>
      <main>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="md:col-span-1">
            <img src="__IMAGE_PLACEHOLDER__" alt="{{fullName}}" class="rounded-lg shadow-2xl w-full">
          </div>
          <div class="md:col-span-2">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="font-black text-4xl mb-4 border-b border-gray-600 pb-2" style="font-family: 'Teko', sans-serif;">Athlete Details</h2>
              <div class="space-y-3 text-lg">
                <p><strong>Date of Birth:</strong> {{dateOfBirth}}</p>
                <p><strong>Status:</strong> {{#if isAmateur}}Amateur{{else}}Professional{{/if}}</p>
                <p><strong>Details:</strong> {{details}}</p>
              </div>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg mt-8">
              <h2 class="font-black text-4xl mb-4 border-b border-gray-600 pb-2" style="font-family: 'Teko', sans-serif;">Achievements</h2>
              <p class="text-lg whitespace-pre-wrap">{{achievements}}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  \`\`\`

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
