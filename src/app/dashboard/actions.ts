
"use server";

import {
  generateSponsorPresentation,
} from "@/ai/flows/generate-sponsor-presentation";
import type { GenerateSponsorPresentationInput } from "@/ai/flows/types";
import { setPageContent } from "@/lib/storage";
import { testAiConnection } from "@/ai/flows/test-ai-connection";
import { generateEnhancedSportpage } from '@/ai/flows/generate-enhanced-sportpage';
import type { GenerateEnhancedSportpageInput } from '@/ai/flows/types';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export async function createBasicPresentation(
  data: GenerateSponsorPresentationInput
) {
  try {
    const { presentation } = await generateSponsorPresentation(data);
    const slug = generateSlug(data.fullName) + `-basic-${Date.now()}`;
    // For basic presentation, wrap it in a simple preformatted HTML for better viewing
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.fullName} - Presentation</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; background-color: #f4f4f9; color: #333; }
        pre { white-space: pre-wrap; background-color: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      </style>
    </head>
    <body>
      <pre>${presentation}</pre>
    </body>
    </html>
    `;

    setPageContent(slug, htmlContent);
    const presentationUrl = `/p/${slug}`;
    return { presentation: htmlContent, presentationUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate basic presentation." };
  }
}

interface CreateEnhancedSportpageData extends GenerateEnhancedSportpageInput {
  photoDataUri: string;
}

export async function createEnhancedSportpage(
  data: CreateEnhancedSportpageData
) {
  try {
    const { photoDataUri, ...athleteData } = data;
    const aiInput: GenerateEnhancedSportpageInput = athleteData;
    const sportpageHtml = await generateEnhancedSportpage(aiInput);

    if (!sportpageHtml) {
      throw new Error("AI did not return HTML content.");
    }

    const finalHtml = sportpageHtml.replace("__IMAGE_PLACEHOLDER__", photoDataUri);

    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;
    setPageContent(slug, finalHtml);
    const sportpageUrl = `/p/${slug}`;
    return { sportpageHtml: finalHtml, sportpageUrl };
  } catch (error: any) {
    console.error("Error in createEnhancedSportpage:", error);
    // Return the specific error message instead of a generic one.
    return { error: `Failed to generate enhanced sportpage: ${error.message}` };
  }
}


export async function performAiConnectionTest() {
  try {
    const result = await testAiConnection();
    return { message: result.message };
  } catch (error) {
    console.error("AI Connection Test Failed:", error);
    if (error instanceof Error) {
      return { error: `AI Connection Failed: ${error.message}` };
    }
    return { error: "An unknown error occurred during the AI connection test." };
  }
}
