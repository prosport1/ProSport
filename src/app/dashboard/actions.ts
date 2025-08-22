"use server";

import {
  generateSponsorPresentation,
  type GenerateSponsorPresentationInput,
} from "@/ai/flows/generate-sponsor-presentation";
import {
  generateEnhancedSportpage,
  type GenerateEnhancedSportpageInput,
} from "@/ai/flows/generate-enhanced-sportpage";

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
    const slug = generateSlug(data.fullName);
    const presentationUrl = `/p/${slug}-basic-${Date.now()}`;
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
    const slug = generateSlug(data.fullName);
    const sportpageUrl = `/p/${slug}-plus-${Date.now()}`;
    return { sportpageHtml, sportpageUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate enhanced sportpage." };
  }
}
