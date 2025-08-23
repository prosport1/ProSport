
"use server";

import {
  generateSponsorPresentation,
  type GenerateSponsorPresentationInput,
} from "@/ai/flows/generate-sponsor-presentation";
import {
  generateEnhancedSportpage,
} from "@/ai/flows/generate-enhanced-sportpage";
import type { GenerateEnhancedSportpageInput } from "@/ai/flows/generate-enhanced-sportpage";
import { setPageContent } from "@/lib/storage";
import { testAiConnection } from "@/ai/flows/test-ai-connection";

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
    setPageContent(slug, presentation);
    const presentationUrl = `/p/${slug}`;
    return { presentation, presentationUrl };
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
    const { sportpageHtml: htmlTemplate } = await generateEnhancedSportpage(athleteData);

    // Replace the placeholder with the actual image data URI
    const finalHtml = htmlTemplate.replace("__IMAGE_PLACEHOLDER__", photoDataUri);

    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;
    setPageContent(slug, finalHtml);
    const sportpageUrl = `/p/${slug}`;
    return { sportpageHtml: finalHtml, sportpageUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate enhanced sportpage." };
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
