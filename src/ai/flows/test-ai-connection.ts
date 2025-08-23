'use server';

/**
 * @fileOverview A simple flow to test the connection to the AI.
 *
 * - testAiConnection - A function that calls the AI with a simple prompt.
 * - TestAiConnectionOutput - The return type for the testAiConnection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestAiConnectionOutputSchema = z.object({
  message: z.string().describe('The success message from the AI.'),
});
export type TestAiConnectionOutput = z.infer<typeof TestAiConnectionOutputSchema>;

export async function testAiConnection(): Promise<TestAiConnectionOutput> {
  return testAiConnectionFlow();
}

const prompt = ai.definePrompt({
  name: 'testAiConnectionPrompt',
  output: {schema: TestAiConnectionOutputSchema},
  prompt: `Please respond with the exact message: "AI Connection Test Successful"`,
});

const testAiConnectionFlow = ai.defineFlow(
  {
    name: 'testAiConnectionFlow',
    outputSchema: TestAiConnectionOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
