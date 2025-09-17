"use strict";

import { logger } from "firebase-functions";
import { initializeApp, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { defineSecret, defineString } from "firebase-functions/params";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import Stripe from "stripe";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getFirestore } from "firebase-admin/firestore";

const ai = genkit({
    plugins: [
        googleAI(),
    ],
});

// ---------- Firebase Admin ----------
// A inicialização foi movida para dentro das funções para "Inicialização Tardia" quando necessário.

// ---------- Secrets ----------
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const NEXT_PUBLIC_APP_URL = defineString("NEXT_PUBLIC_APP_URL", {
  default: "http://localhost:9003",
});

// ---------- Schemas de Validação (Zod) ----------
const PayloadSchema = z.object({
  plano: z.enum(["basic", "plus", "premium", "pro"]),
  modalidade: z.string().min(1, "Modalidade é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  status: z.enum(["Amador", "Profissional"]).optional(),
  graduacao: z.string().min(1, "Graduação é obrigatória"),
  equipe: z.string().min(1, "Equipe é obrigatória"),
  titulos: z.string().min(1, "Títulos são obrigatórios"),
  imagem: z.string().url("URL da imagem principal inválida"),
  contato: z.string().min(1, "Contato é obrigatório"),
  styleHint: z.string().optional(),
  imagensExtra: z.array(z.string().url()).optional(),
  bgImagem: z.string().url("URL da imagem de fundo inválida").optional(),
  youtubeLink: z.string().url("URL do YouTube inválida").optional(),
  instagramUrl: z.string().url("URL do Instagram inválida").optional(),
  facebookUrl: z.string().url("URL do Facebook inválida").optional(),
});
type Payload = z.infer<typeof PayloadSchema>;

const CreateCheckoutPayloadSchema = z.object({
  planId: z.string(),
  isAnnual: z.boolean(),
  userId: z.string(),
});

// Tipos explícitos para o objeto de planos
type PriceDetail = { id: string };
type PlanDetail = {
  name: string;
  prices: {
    monthly: PriceDetail;
    annual: PriceDetail;
  };
};
type PlanDetails = {
  basic: PlanDetail;
  plus: PlanDetail;
  premium: PlanDetail;
  pro: PlanDetail;
};

// ---------- Utils ----------
function slugify(x: string) {
  return (x || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cssReset() {
  return `
*{box-sizing:border-box}
:root{color-scheme:dark light}
html,body{margin:0;padding:0}
img{display:block;max-width:100%;height:auto}
a{text-decoration:none}
  `.trim();
}

function safeMailFromContato(contato: string) {
  const match = (contato || "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return match ? match[0] : "";
}

function ctas(nome: string, contato: string) {
    const isPhone = /^\+?[0-9\s-()]+$/.test(contato);
    const href = isPhone ? `https://wa.me/${contato.replace(/\D/g, '')}` : `mailto:${safeMailFromContato(contato) || '#contato'}`;
    const ctaText = isPhone ? "Falar no WhatsApp" : "Patrocinar " + nome;

    return `<a class="btn" href="${href}">${ctaText}</a>
  <button class="btn ghost" onclick="navigator.clipboard.writeText(location.href)">Copiar link</button>`;
}


// ---------- Biblioteca “style hint” ----------
type StylePack = {
  palettes: string[][];
  fonts: string[][];
  bgHints: string[];
  icons?: string[];
  ctas?: string[];
};

const STYLE_BY_SPORT: Record<string, StylePack> = {
  "Jiu-Jitsu": {
    palettes: [
      ["#0b0b0d", "#e11d48", "#22d3ee", "#f1f5f9"],
      ["#0d0f12", "#c1121f", "#ffba08", "#e6e6eb"],
      ["#0b0b0d", "#ea580c", "#eab308", "#e5e7eb"],
    ],
    fonts: [
      ["Montserrat", "Inter"],
      ["Oswald", "Lato"],
      ["Bebas Neue", "Inter"],
    ],
    bgHints: ["textura de tatame com blur", "trama de kimono escuro", "dojo PB"],
    icons: ["🥋", "🏆", "🇧🇷"],
    ctas: ["Patrocinar agora", "Falar com o atleta", "Quero apoiar"],
  },
};

const FALLBACK_STYLE: StylePack = {
  palettes: [["#0b0b0d", "#22d3ee", "#e11d48", "#f1f5f9"]],
  fonts: [["Montserrat", "Inter"]],
  bgHints: ["gradiente suave"],
  icons: ["⭐"],
  ctas: ["Quero patrocinar"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildStyleHint(modalidade: string) {
  const key = Object.keys(STYLE_BY_SPORT).find((k) =>
    (modalidade || "").toLowerCase().includes(k.toLowerCase())
  );
  const pack = key ? STYLE_BY_SPORT[key] : FALLBACK_STYLE;
  const palette = pick(pack.palettes);
  const fonts = pick(pack.fonts);
  const bg = pick(pack.bgHints);
  const [bgc, primary, accent, text = "#f1f5f9"] = palette;
  const [fontHead, fontBody] = fonts;

  return `
Diretrizes visuais sugeridas:
- Paleta (hex): BG ${bgc} | Primária ${primary} | Acento ${accent} | Texto ${text}
- Tipografia (Google Fonts): Títulos "${fontHead}", Corpo "${fontBody}"
- Background: ${bg}
- Ícones sugeridos: ${(pack.icons || ["⭐"]).join(" ")}
- CTA sugerido: "${pick(pack.ctas || ["Patrocinar agora"])}"
(OBS: Alterne hero, proporções e grade a cada geração.)
  `.trim();
}

// ---------- Garantia de Background ----------
async function ensureBackground(modalidade: string): Promise<string | null> {
  if (getApps().length === 0) {
    initializeApp();
  }
  try {
    const bucket = getStorage().bucket();
    const slug = slugify(modalidade) || "bg";
    const path = `backgrounds/${slug}.jpg`;
    const file = bucket.file(path);

    const [exists] = await file.exists();
    if (exists) {
      return `https://storage.googleapis.com/${bucket.name}/${path}`;
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    const prompt = `
Background fotográfico temático de ${modalidade}, estilo “cine still”,
sem pessoas/rostos, sem logos, sem texto.
Composição para fundo de landing page, luz dramática suave,
textura leve e tons coerentes ao esporte.
    `.trim();

    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1792x1024",
      quality: "hd",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = img.data?.[0]?.b64_json;
    if (!b64) throw new Error("Falha ao gerar imagem (b64 vazio).");
    const buffer = Buffer.from(b64, "base64");

    await file.save(buffer, {
      contentType: "image/jpeg",
      metadata: { cacheControl: "public,max-age=31536000,immutable" },
    });
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${path}`;
  } catch (err: any) {
    logger.warn(`ensureBackground falhou: ${err?.message || err}`);
    return null;
  }
}

// ---------- PROMPTS (SYSTEM) ----------
const PROMPT_BASIC_SYSTEM = `
Você é um designer web focado em criar propostas de patrocínio claras e profissionais. Gere um arquivo HTML5 completo, responsivo, com CSS embutido. A estética deve ser limpa, estruturada em blocos e inspirada em um folheto digital moderno.

Regras obrigatórias (BASIC):
- **Layout em Blocos de Cores:**
  - **Bloco Superior:** Crie uma seção superior com uma cor de fundo sólida (ex: um verde escuro profissional). Esta seção deve conter o título "PROPOSTA DE PATROCÍNIO" no topo, seguido pela imagem principal do atleta. A imagem deve preencher a largura do bloco e ter as bordas superiores arredondadas.
  - **Divisor de Seção:** Use uma forma de onda ou curva suave (pode ser um SVG embutido ou CSS clip-path) para criar uma transição elegante entre o bloco de cor superior e a seção de conteúdo abaixo.
  - **Bloco de Conteúdo Principal:** Esta seção deve ter um fundo de cor clara e neutra (ex: off-white, #F8F7F4).
- **Estrutura do Conteúdo:**
  - Logo abaixo do divisor, adicione um título de seção centralizado (ex: "Visão Geral do Atleta") seguido por um parágrafo introdutório.
  - Crie uma **grade de três colunas** (em desktop, que se torna uma coluna em mobile) com cards informativos.
  - **Design dos Cards:** Cada card deve ter um fundo de cor sutil (um tom um pouco mais escuro que o fundo da seção), bordas arredondadas, e conter: um ÍCONE, um TÍTULO em negrito, e um texto descritivo.
- **Botão de CTA:** No final da página, adicione um botão de CTA centralizado, com a cor sólida principal e texto claro.
- **Tipografia:** Use fontes sans-serif limpas e de alta legibilidade (ex: "Poppins" para títulos, "Lato" para corpo de texto).
- **Paleta de Cores:** A paleta deve ser profissional e terrosa. Ex: um verde escuro principal, um fundo off-white/bege para o conteúdo, e texto escuro (#333) para máxima legibilidade.
- **Otimização e Acessibilidade:** Código leve, mobile-first. Garanta que todas as imagens tenham 'alt' tags e use HTML semântico. CSS deve estar em uma única tag <style> no <head>.

Saída: SOMENTE o HTML final, sem explicações.
`;

const PROMPT_PLUS_SYSTEM = `
Você é designer sênior. Gere HTML5 completo e responsivo, com CSS embutido, estética moderna e cinematográfica leve.

Regras obrigatórias (PLUS):
- Estética de card esportivo cinematográfico com profundidade, luz e microinterações suaves. Use 'transform: scale(1.03)' ou mudança de sombra em 'hover' nos botões e cards. Duração das transições: 150–250ms.
- Foto do atleta em 6K no hero. Realize um recorte elegante usando 'clip-path' (ex: polygon(...) ou inset(...) com bordas arredondadas) e posicione-a parcialmente sobre outros elementos para criar um efeito de camada (layers).
- BACKGROUND 6K TEMÁTICO E DESFOCADO por biblioteca: use a imagem oficial da modalidade. Aplique efeitos de CSS como 'filter: grain(...) vignette(...)' de forma sutil para textura. Aplicar overlays para garantir legibilidade.
- Ícones/emoji consistentes nas seções.
- Paleta alinhada à modalidade (via styleHint), garantindo contraste mínimo de 4.5:1 (WCAG AA).
- Adaptação automática ao aparelho; respeitar prefers-reduced-motion. Layout deve ser assimétrico em telas maiores para um visual mais dinâmico.
- Gerar “Descrição do Atleta” (60–110 palavras) com apelo comercial, sem promessas irreais.
- Diversidade via VARIANT_ID. Sem frameworks JS/CSS externos (apenas Google Fonts).
- CSS crítico na tag <style> no <head>. Garanta acessibilidade com 'alt' tags e HTML semântico.

Saída: SOMENTE o HTML final.
`;

const PROMPT_PREM_SYSTEM = `
Você é um Diretor de Arte Sênior especializado em design digital para atletas de elite. Gere um arquivo HTML5 completo, mobile-first, com CSS embutido. A estética deve ser idêntica à de um card de jogador premium, como os vistos em apps de esportes modernos.

Regras obrigatórias (PREMIUM):
- **Layout de Coluna Única:** O design deve ser vertical e otimizado para telas de celular.
- **Herói em Camadas (Layers):**
  - A imagem principal do atleta (6K) deve ser a camada de fundo da seção do herói (topo da página).
  - **Aplique um overlay de gradiente escuro na parte inferior da imagem ('linear-gradient(to top, #0A0F0B, transparent)') para que ela se funda suavemente com a cor de fundo sólida da página.**
  - O nome do atleta e o botão de CTA principal devem ficar SOBRE a imagem.
- **Elemento Gráfico de Fundo:** Se houver um número associado ao atleta (como número da camisa), use-o como um elemento de design gráfico grande e semi-transparente atrás do nome do atleta.
- **Tipografia de Impacto:**
  - Para o nome do atleta, use uma fonte sans-serif condensada e em maiúsculas (ex: "Oswald", "Bebas Neue") com grande destaque.
  - Para os títulos das seções, use uma fonte sans-serif limpa, em maiúsculas, precedida por um ícone e com uma linha divisória de destaque abaixo.
- **Seção de Estatísticas (KPIs):** Apresente as principais conquistas (Títulos) logo abaixo do nome, em formato de pares ÍCONE + TEXTO, dispostos horizontalmente.
- **Paleta de Cores Sofisticada:** Use um fundo muito escuro (preto ou um tom de cor saturado e escuro). Utilize branco para o texto principal e uma única cor de destaque (como ouro, bronze ou um neon vibrante) para o CTA, ícones e detalhes gráficos.
- **Qualidade e Acessibilidade:** Garanta contraste WCAG AA. CSS no <head>. Acessibilidade impecável com ARIA roles, 'alt' tags e HTML semântico (<header>, <main>, <section>).
- **Sem frameworks JS/CSS externos (apenas Google Fonts).**

Saída: SOMENTE o HTML final, sem comentários ou explicações.
`.trim();

const PROMPT_PRO_SYSTEM = PROMPT_PREM_SYSTEM;

function systemFor(plano: string) {
  if (plano === "plus") return PROMPT_PLUS_SYSTEM;
  if (plano === "premium" || plano === "pro") return PROMPT_PREM_SYSTEM;
  return PROMPT_BASIC_SYSTEM;
}

function userFor(p: Payload, v: number) {
  const common = `
${p.styleHint || buildStyleHint(p.modalidade)}

DADOS DO ATLETA:
- VARIANT_ID: ${v}
- Modalidade: ${p.modalidade}
- Nome: ${p.nome}
- Nascimento: ${p.data_nascimento}
- Status: ${p.status ?? "Profissional"}
- Graduação: ${p.graduacao}
- Equipe: ${p.equipe}
- Títulos: ${p.titulos}
- Imagem Principal (URL): ${p.imagem}
- Contato Principal (WhatsApp/Email): ${p.contato}
${p.instagramUrl ? `- Instagram: ${p.instagramUrl}` : ""}
${p.facebookUrl ? `- Facebook: ${p.facebookUrl}` : ""}
${p.youtubeLink ? `- Vídeo (YouTube): ${p.youtubeLink}` : ""}
${p.bgImagem ? `- Imagem de Fundo (URL): ${p.bgImagem}` : ""}
`.trim();
  
  if (p.plano === "premium" || p.plano === "pro" || p.plano === "plus") {
    return `
${common}
- Imagens Extras (Galeria de URLs): ${(p.imagensExtra ?? []).join(", ") || "(sem extras)"}
    `.trim();
  }

  return common;
}


function variantId() {
  return Math.floor(Math.random() * 1_000_000);
}

// ---------- Fallbacks HTML ----------
function heroShellHTML(titleFont: string, bodyFont: string, p: Payload, useParallax = false) {
  const bg = p.bgImagem ? p.bgImagem.replace(/"/g, "%22") : "";
  return `
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    titleFont
  )}:wght@600;800&family=${encodeURIComponent(
    bodyFont
  )}:wght@400;600;700&display=swap" rel="stylesheet">
<style>
${cssReset()}
:root{--tx:#eef2f6;--pri:#e11d48}
body{background:#0b0b0d;color:var(--tx);font-family:${bodyFont},system-ui,Arial,sans-serif}
.hero{position:relative;min-height:72vh;overflow:clip;}
.hero-bg{position:absolute;inset:0;z-index:0;background-image:${bg ? `url('${bg}')` : "none"};}
.hero-bg-img{width:100%;height:100%;object-fit:cover;
  ${bg ? "filter: blur(14px) saturate(1.08) brightness(.75);" : ""}
  transform:scale(1.06);}
.hero-bg-overlay{position:absolute;inset:0;background:${bg
      ? "radial-gradient(1200px 600px at 70% 35%, rgba(0,0,0,.25), rgba(0,0,0,.65))"
      : "linear-gradient(180deg,#0b0b0d,#111418)"
    };}
.hero-content{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:32px 20px;display:grid;gap:28px;grid-template-columns:1.1fr .9fr;align-items:center}
.athlete-photo{width:100%;height:auto;border-radius:18px;box-shadow:0 30px 70px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.18)}
.hero-title{font:800 56px/1.05 "${titleFont}",system-ui,Arial,sans-serif;margin:0 0 6px;letter-spacing:.5px}
.hero-sub{opacity:.92;margin:0 0 10px}
.hero-desc{opacity:.95;margin:8px 0 16px;max-width:60ch}
.btn{display:inline-block;background:var(--pri);color:#fff;padding:12px 18px;border-radius:12px;font-weight:700;border:0;cursor:pointer;transition:transform .18s ease,opacity .18s}
.btn:hover{transform:translateY(-2px);opacity:.95}
.btn.ghost{background:transparent;color:var(--tx);border:1px solid rgba(255,255,255,.35);margin-left:8px}
.section{max-width:1200px;margin:36px auto 0;padding:0 20px}
.section-title{font:800 28px/1.15 "${titleFont}",system-ui,Arial,sans-serif;margin:0 0 6px;letter-spacing:.2px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:16px;transition:transform .18s ease,box-shadow .18s ease}
.card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.35)}
.card-ico{font-size:22px;margin-bottom:8px}
.card-title{font:700 16px/1.2 ${bodyFont},system-ui,Arial,sans-serif;margin:0 0 6px}
.card-txt{margin:0;opacity:.9}
.footer{max-width:1200px;margin:28px auto;padding:0 20px;opacity:.9}
@media (max-width:980px){.hero-content{grid-template-columns:1fr}.hero-title{font-size:40px}.cards{grid-template-columns:1fr}}
${useParallax ? `.hero-bg{background-attachment: fixed;}` : ""}
</style>
<header class="hero">
  <div class="hero-bg" aria-hidden="true">
    ${bg ? `<img class="hero-bg-img" src="${bg}" alt="">` : ""}
    <div class="hero-bg-overlay"></div>
  </div>
  <div class="hero-content">
    <img class="athlete-photo" src="${p.imagem}" alt="Foto de ${p.nome}">
    <div>
      <h1 class="hero-title">${p.nome}</h1>
      <p class="hero-sub"><strong>${p.modalidade}</strong> • ${p.graduacao} • ${p.equipe} • Nasc. ${p.data_nascimento} • ${p.status ?? "Profissional"}</p>
      <p class="hero-desc">Proposta de patrocínio do atleta.</p>
      <div class="cta-row">${ctas(p.nome, p.contato)}</div>
    </div>
  </div>
</header>
`.trim();
}

function fallbackBasic(p: Payload) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${p.nome} — ${p.modalidade}</title>
${heroShellHTML("Montserrat", "Inter", p)}
<main class="section">
  <h2 class="section-title">Conquistas</h2>
  <div class="cards">
    <article class="card"><div class="card-ico">🏆</div><h3 class="card-title">Títulos</h3><p class="card-txt">${p.titulos}</p></article>
    <article class="card"><div class="card-ico">📣</div><h3 class="card-title">Presença</h3><p class="card-txt">Eventos, mídia e ativações.</p></article>
    <article class="card"><div class="card-ico">🤝</div><h3 class="card-title">Oportunidades</h3><p class="card-txt">Planos de visibilidade.</p></article>
  </div>
</main>
<p class="footer" id="contato">Contato: ${p.contato}</p>
</html>`;
}

function fallbackPlus(p: Payload) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${p.nome} — ${p.modalidade}</title>
${heroShellHTML("Bebas Neue", "Inter", p)}
<main class="section">
  <h2 class="section-title">Proposta</h2>
  <div class="cards">
    <article class="card"><div class="card-ico">🎯</div><h3 class="card-title">Visibilidade</h3><p class="card-txt">Branding em uniformes e conteúdos.</p></article>
    <article class="card"><div class="card-ico">🎥</div><h3 class="card-title">Conteúdo</h3><p class="card-txt">Pacotes de fotos, reels e bastidores.</p></article>
    <article class="card"><div class="card-ico">🌐</div><h3 class="card-title">Comunidade</h3><p class="card-txt">Ativações e workshops.</p></article>
  </div>
</main>
<p class="footer" id="contato">Contato: ${p.contato}</p>
</html>`;
}

function fallbackPremium(p: Payload) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${p.nome} — ${p.modalidade}</title>
${heroShellHTML("Oswald", "Inter", p, true)}
<main class="section">
  <h2 class="section-title">Destaques Premium</h2>
  <div class="cards">
    <article class="card"><div class="card-ico">🥇</div><h3 class="card-title">Conquistas</h3><p class="card-txt">${p.titulos}</p></article>
    <article class="card"><div class="card-ico">🛡️</div><h3 class="card-title">Reputação</h3><p class="card-txt">Histórico vencedor e visibilidade internacional.</p></article>
    <article class="card"><div class="card-ico">📺</div><h3 class="card-title">Amplificação</h3><p class="card-txt">Mídia, jornais, blogs e canais digitais.</p></article>
  </div>
</main>
<p class="footer" id="contato">Contato: ${p.contato}</p>
</html>`;
}

function buildFallbackHTML(p: Payload) {
  if (p.plano === "premium") return fallbackPremium(p);
  if (p.plano === "plus") return fallbackPlus(p);
  return fallbackBasic(p);
}


// ---------- Stripe Helpers ----------
const planDetails: PlanDetails = {
    basic: {
        name: "Básico",
        prices: {
            monthly: { id: "price_1PgTrOC4n6gXn9f9rLd5YJ2r" },
            annual: { id: "price_1PgTrOC4n6gXn9f9Yj5K5f3t" },
        },
    },
    plus: {
        name: "Plus",
        prices: {
            monthly: { id: "price_1PgTquC4n6gXn9f9d7f3Yj0N" },
            annual: { id: "price_1PgTquC4n6gXn9f9mK6gL9hJ" },
        },
    },
    premium: {
        name: "Premium",
        prices: {
            monthly: { id: "price_1PgTsHC4n6gXn9f9eGkK7J8L" },
            annual: { id: "price_1PgTsHC4n6gXn9f9Nl8kM2oP" },
        },
    },
    pro: {
        name: "Pro",
        prices: {
            monthly: { id: "price_1PgTtgC4n6gXn9f9jK0d9L7M" },
            annual: { id: "price_1PgTtgC4n6gXn9f9Hk2lO7vQ" },
        },
    },
};

// ---------- Genkit Flows ----------
const generateLandingFlow = ai.defineFlow(
    {
        name: "generateLandingFlow",
        inputSchema: PayloadSchema,
        outputSchema: z.object({
            ok: z.boolean(),
            url: z.string(),
            id: z.string(),
            plano: z.enum(["basic", "plus", "premium", "pro"]),
            used_fallback: z.boolean(),
            variant: z.number(),
            bg_used: z.string(),
        }),
    },
    async (payload) => {
        try {
            const data: Payload = { ...payload, bgImagem: payload.bgImagem || await ensureBackground(payload.modalidade) || undefined };
            let html = "";
            let usedFallback = false;
            const variant = variantId();

            try {
                const apiKey = OPENAI_API_KEY.value();
                if (!apiKey) throw new Error("OPENAI_API_KEY ausente");
                const openai = new OpenAI({ apiKey });

                const messages: ChatCompletionMessageParam[] = [
                    { role: "system", content: systemFor(data.plano) },
                    { role: "user", content: userFor(data, variant) },
                ];

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    temperature: 0.85,
                    messages,
                });

                html = completion.choices[0]?.message?.content || "";
                
                logger.info("---- RESPOSTA RECEBIDA DA OPENAI ----", { response: html });

                if (!html.includes("<!doctype html")) {
                    throw new Error("HTML inválido da LLM.");
                }
            } catch (err: any) {
                usedFallback = true;
                logger.error("!!!! ERRO DETALHADO DA API OPENAI !!!!", err);
                html = buildFallbackHTML(data);
            }

            const bucket = getStorage().bucket();
            const id = `${Date.now()}-${slugify(data.nome)}`;
            const path = `landingpages/${data.plano}/${id}.html`;
            const file = bucket.file(path);

            await file.save(html, { contentType: "text/html; charset=utf-8" });
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

            return {
                ok: true,
                url: publicUrl,
                id,
                plano: data.plano,
                used_fallback: usedFallback,
                variant,
                bg_used: data.bgImagem || "(gerado via IA)",
            };
        } catch (e: any) {
            logger.error("Erro em generateLandingFlow:", e);
            if (e instanceof HttpsError) throw e;
            throw new HttpsError("internal", e?.message || "Erro interno no fluxo de geração.");
        }
    }
);


const createStripeCheckoutSessionFlow = ai.defineFlow(
    {
        name: "createStripeCheckoutSessionFlow",
        inputSchema: CreateCheckoutPayloadSchema,
        outputSchema: z.object({ url: z.string() }),
    },
    async (payload) => {
        try {
            if (getApps().length === 0) {
              initializeApp();
            }
            
            const { planId, isAnnual, userId } = payload;
            const appUrl = NEXT_PUBLIC_APP_URL.value();

            const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
                apiVersion: '2024-06-20'
            });

            logger.info(`Processando checkout para planId: ${planId}, isAnnual: ${isAnnual}`);

            const planKey = planId as keyof typeof planDetails;
            const billingCycle = isAnnual ? 'annual' : 'monthly';

            const plan = planDetails[planKey];
            if (!plan) {
                logger.error(`Plano não encontrado para a chave: ${planKey}`);
                throw new HttpsError('not-found', `Plano com a chave "${planKey}" não foi encontrado.`);
            }

            const priceId = plan.prices[billingCycle]?.id;
            if (!priceId) {
                logger.error(`Price ID não encontrado para o plano: ${planId} (${billingCycle})`);
                throw new HttpsError('not-found', `Price ID não encontrado para o plano: ${planId} (${billingCycle}).`);
            }
            logger.info(`Price ID encontrado: ${priceId}`);
            
            const db = getFirestore();
            const userDoc = await db.collection('users').doc(userId).get();
            const user = userDoc.data();
            
            let customerId = user?.stripeCustomerId;

            if (!customerId) {
                const customer = await stripe.customers.create({
                    metadata: {
                        firebaseUID: userId,
                    },
                });
                customerId = customer.id;
                await db.collection('users').doc(userId).set({ stripeCustomerId: customerId }, { merge: true });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [ { price: priceId, quantity: 1 } ],
                mode: 'subscription',
                customer: customerId,
                success_url: `${appUrl}/portal/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${appUrl}/portal/cancel`,
                // Adiciona metadados para saber qual plano foi comprado
                metadata: {
                    userId: userId,
                    planId: planId,
                    billingCycle: billingCycle,
                }
            });

            if (!session.url) {
                logger.error("Sessão do Stripe criada, mas a URL não foi retornada.");
                throw new HttpsError('internal', 'A sessão de checkout do Stripe foi criada, mas não contém uma URL.');
            }
            return { url: session.url };
        } catch (error: any) {
            logger.error('Erro ao criar a sessão de checkout do Stripe:', error);
            if (error instanceof Stripe.errors.StripeError) {
                throw new HttpsError('internal', `Erro do Stripe: ${error.message}`);
            }
            throw new HttpsError('internal', `Falha ao criar a sessão de checkout do Stripe: ${error.message}`);
        }
    }
);


// ---------- Cloud Functions v2 (Wrappers for Genkit Flows) ----------
export const generateLanding = onCall(
    { memory: '1GiB', region: "southamerica-east1", timeoutSeconds: 120, secrets: [OPENAI_API_KEY], cors: true },
    async (request) => {
        if (getApps().length === 0) {
            initializeApp();
        }
        try {
            const data = PayloadSchema.parse(request.data);
            return await generateLandingFlow(data);
        } catch (e: any) {
            logger.error("Erro na validação ou execução de generateLanding:", e);
              if (e instanceof z.ZodError) {
                console.error("---- ERRO DE VALIDAÇÃO ZOD ----", JSON.stringify(e.issues, null, 2));
                throw new HttpsError("invalid-argument", "Dados de entrada inválidos.", e.issues);
              }
            if (e instanceof HttpsError) throw e;
            throw new HttpsError("internal", e?.message || "Erro interno do servidor");
        }
    }
);

export const createStripeCheckoutSession = onCall(
    { memory: '1GiB', region: 'southamerica-east1', secrets: [STRIPE_SECRET_KEY], cors: true },
    async (request) => {
        if (getApps().length === 0) {
          initializeApp();
        }
        try {
            const data = CreateCheckoutPayloadSchema.parse(request.data);
            return await createStripeCheckoutSessionFlow(data);
        } catch (e: any) {
            logger.error('Erro na validação ou execução de createStripeCheckoutSession:', e);
              if (e instanceof z.ZodError) {
                console.error("---- ERRO DE VALIDAÇÃO ZOD (Stripe) ----", JSON.stringify(e.issues, null, 2));
                throw new HttpsError("invalid-argument", "Dados de entrada para o checkout inválidos.", e.issues);
              }
            if (e instanceof HttpsError) throw e;
            throw new HttpsError('internal', `Falha na chamada da função de checkout: ${e.message}`);
        }
    }
);

// ---------- Stripe Webhook ----------
export const stripeWebhook = onRequest(
    { region: 'southamerica-east1', secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
    async (request, response) => {
        if (getApps().length === 0) {
            initializeApp();
        }
        
        const stripe = new Stripe(STRIPE_SECRET_KEY.value(), { apiVersion: '2024-06-20' });
        const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
        
        let event: Stripe.Event;

        if (request.rawBody) {
            const signature = request.headers['stripe-signature'];
            if (!signature) {
                logger.error("⚠️  Webhook signature verification failed. No signature header.");
                response.status(400).send('Webhook Error: No signature header');
                return;
            }
            try {
                event = stripe.webhooks.constructEvent(request.rawBody, signature, webhookSecret);
            } catch (err: any) {
                logger.error(`⚠️  Webhook signature verification failed.`, { error: err.message });
                response.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }
        } else {
            logger.error("⚠️  Webhook error. No rawBody.");
            response.status(400).send('Webhook Error: No rawBody');
            return;
        }

        const db = getFirestore();

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const { userId, planId, billingCycle } = session.metadata || {};

                    if (!userId || !planId || !billingCycle) {
                        throw new Error(`checkout.session.completed missing required metadata. Session ID: ${session.id}`);
                    }
                    
                    const userDocRef = db.collection('users').doc(userId);
                    await userDocRef.update({
                        planId: planId,
                        planStatus: 'active',
                        billingCycle: billingCycle,
                        stripeSubscriptionId: session.subscription,
                    });
                    logger.info(`✅ User ${userId} plan set to ${planId} (${billingCycle}) and status active.`);
                    break;
                }

                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const userQuery = await db.collection('users').where('stripeSubscriptionId', '==', subscription.id).limit(1).get();
                    
                     if (userQuery.empty) {
                        logger.warn(`User with stripeSubscriptionId ${subscription.id} not found for cancellation.`);
                        break;
                    }
                    const userDoc = userQuery.docs[0];
                    await userDoc.ref.update({ planStatus: 'inactive' });
                    logger.info(`✅ User ${userDoc.id} plan set to inactive due to subscription deletion.`);
                    break;
                }

                default:
                    logger.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
            }

            response.status(200).send({ received: true });

        } catch (error: any) {
            logger.error("🔥 Webhook handler error:", error);
            response.status(500).send({ error: error.message });
        }
    }
);
