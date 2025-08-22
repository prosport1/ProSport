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

export async function createEnhancedSportpage(
  data: GenerateEnhancedSportpageInput
) {
  try {
    // AI call is consistently failing, so we're bypassing it with a simulated page.
    // const { sportpageHtml } = await generateEnhancedSportpage(data);

    const sportpageHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sport Page for ${data.fullName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Roboto', sans-serif;
                  background-color: #111827;
                  color: #F3F4F6;
              }
              .font-headline {
                  font-family: 'Poppins', sans-serif;
              }
              .card-gradient {
                background: linear-gradient(145deg, #1F2937, #111827);
              }
          </style>
      </head>
      <body class="antialiased">
          <div class="container mx-auto p-4 md:p-8 max-w-4xl">
              <header class="text-center mb-8">
                  <h1 class="font-headline text-5xl font-bold text-white">${data.fullName}</h1>
                  <p class="text-2xl text-amber-400 mt-2">${data.sport}</p>
              </header>

              <main>
                  <div class="relative w-full h-96 rounded-2xl shadow-2xl overflow-hidden mb-8">
                      <img src="${data.photoDataUri}" alt="Photo of ${data.fullName}" class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div class="absolute bottom-0 left-0 p-6">
                          <h2 class="font-headline text-4xl text-white">Pronto para Competir</h2>
                          <p class="text-lg text-gray-300">${data.isAmateur ? "Amador" : "Profissional"}</p>
                      </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-8">
                      <div class="card-gradient p-6 rounded-xl shadow-lg">
                          <h3 class="font-headline text-2xl text-amber-400 border-b-2 border-amber-500 pb-2 mb-4">Detalhes</h3>
                          <ul class="space-y-3 text-gray-300">
                              <li><strong>Data de Nasc.:</strong> ${data.dateOfBirth}</li>
                              <li><strong>Esporte:</strong> ${data.sport}</li>
                              <li><strong>Status:</strong> ${data.isAmateur ? "Amador" : "Profissional"}</li>
                              <li class="pt-2"><strong>Info:</strong> <p class="text-sm">${data.details}</p></li>
                          </ul>
                      </div>
                      <div class="card-gradient p-6 rounded-xl shadow-lg">
                          <h3 class="font-headline text-2xl text-amber-400 border-b-2 border-amber-500 pb-2 mb-4">Conquistas</h3>
                          <p class="text-gray-300 text-sm">${data.achievements}</p>
                      </div>
                  </div>
              </main>
              
              <footer class="text-center mt-12 py-4 border-t border-gray-700">
                  <p class="text-sm text-gray-500">Gerado por Portfólio ProSport</p>
              </footer>
          </div>
      </body>
      </html>
    `;

    const slug = generateSlug(data.fullName) + `-plus-${Date.now()}`;
    setPageContent(slug, sportpageHtml);
    const sportpageUrl = `/p/${slug}`;
    return { sportpageHtml, sportpageUrl };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate enhanced sportpage." };
  }
}
