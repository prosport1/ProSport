"use server";

import {
  generateSponsorPresentation,
  type GenerateSponsorPresentationInput,
} from "@/ai/flows/generate-sponsor-presentation";
import {
  generateEnhancedSportpage,
  type GenerateEnhancedSportpageInput,
} from "@/ai/flows/generate-enhanced-sportpage";
import { setPageContent } from "@/lib/storage";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export async function createBasicPresentation(
  data: Omit<GenerateSponsorPresentationInput, "weightCategory" | "martialArtsRanking"> & { details: string }
) {
  try {
    const input: GenerateSponsorPresentationInput = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      sport: data.sport,
      isAmateur: data.isAmateur,
      achievements: data.achievements,
      stats: data.stats,
    };
    const { presentation } = await generateSponsorPresentation(input);
    const slug = generateSlug(data.fullName) + `-basic-${Date.now()}`;
    setPageContent(slug, presentation);
    const presentationUrl = `/p/${slug}`;
    return { presentation, presentationUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate basic presentation." };
  }
}

export async function createEnhancedSportpage(
  data: GenerateEnhancedSportpageInput
) {
  try {
    const { sportpageHtml } = await generateEnhancedSportpage(data);
    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;
    setPageContent(slug, sportpageHtml);
    const sportpageUrl = `/p/${slug}`;
    return { sportpageHtml, sportpageUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate enhanced sportpage." };
  }
}
