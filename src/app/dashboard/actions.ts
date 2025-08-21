"use server";

import {
  generateSponsorPresentation,
  type GenerateSponsorPresentationInput,
} from "@/ai/flows/generate-sponsor-presentation";
import {
  generateEnhancedSportpage,
  type GenerateEnhancedSportpageInput,
} from "@/ai/flows/generate-enhanced-sportpage";

export async function createBasicPresentation(
  data: Omit<GenerateSponsorPresentationInput, "weightCategory" | "martialArtsRanking"> & { details: string }
) {
  try {
    // The AI prompt uses achievements and stats, so we ensure they are present.
    const input: GenerateSponsorPresentationInput = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      sport: data.sport,
      isAmateur: data.isAmateur,
      achievements: data.achievements,
      stats: data.stats,
      // We can parse details to extract optional fields if needed, or pass it along.
      // For now, let's keep it simple.
    };
    const { presentation } = await generateSponsorPresentation(input);
    return { presentation };
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
    return { sportpageHtml };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate enhanced sportpage." };
  }
}
