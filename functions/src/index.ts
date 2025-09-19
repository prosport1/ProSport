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

// A inicialização foi movida para dentro das funções (Lazy Initialization).

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const NEXT_PUBLIC_APP_URL = defineString("NEXT_PUBLIC_APP_URL", {
  default: "http://localhost:9003",
});

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

type PriceDetail = { id: string };
type PlanDetail = {
  name: string;
  prices: { monthly: PriceDetail; annual: PriceDetail; };
};
type PlanDetails = {
  basic: PlanDetail;
  plus: PlanDetail;
  premium: PlanDetail;
  pro: PlanDetail;
};

function slugify(x: string) { return (x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function cssReset() { return `*{box-sizing:border-box}:root{color-scheme:dark light}html,body{margin:0;padding:0}img{display:block;max-width:100%;height:auto}a{text-decoration:none}`.trim(); }
function safeMailFromContato(contato: string) { const match = (contato || "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i); return match ? match[0] : ""; }
function ctas(nome: string, contato: string) { const isPhone = /^\+?[0-9\s-()]+$/.test(contato); const href = isPhone ? `https://wa.me/${contato.replace(/\D/g, '')}` : `mailto:${safeMailFromContato(contato) || '#contato'}`; const ctaText = isPhone ? "Falar no WhatsApp" : "Patrocinar " + nome; return `<a class="btn" href="${href}">${ctaText}</a><button class="btn ghost" onclick="navigator.clipboard.writeText(location.href)">Copiar link</button>`; }
type StylePack = { palettes: string[][]; fonts: string[][]; bgHints: string[]; icons?: string[]; ctas?: string[]; };
const STYLE_BY_SPORT: Record<string, StylePack> = { "Jiu-Jitsu": { palettes: [["#0b0b0d", "#e11d48", "#22d3ee", "#f1f5f9"], ["#0d0f12", "#c1121f", "#ffba08", "#e6e6eb"], ["#0b0b0d", "#ea580c", "#eab308", "#e5e7eb"]], fonts: [["Montserrat", "Inter"], ["Oswald", "Lato"], ["Bebas Neue", "Inter"]], bgHints: ["textura de tatame com blur", "trama de kimono escuro", "dojo PB"], icons: ["🥋", "🏆", "🇧🇷"], ctas: ["Patrocinar agora", "Falar com o atleta", "Quero apoiar"], }, };
const FALLBACK_STYLE: StylePack = { palettes: [["#0b0b0d", "#22d3ee", "#e11d48", "#f1f5f9"]], fonts: [["Montserrat", "Inter"]], bgHints: ["gradiente suave"], icons: ["⭐"], ctas: ["Quero patrocinar"], };
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function buildStyleHint(modalidade: string) { const key = Object.keys(STYLE_BY_SPORT).find((k) => (modalidade || "").toLowerCase().includes(k.toLowerCase())); const pack = key ? STYLE_BY_SPORT[key] : FALLBACK_STYLE; const palette = pick(pack.palettes); const fonts = pick(pack.fonts); const bg = pick(pack.bgHints); const [bgc, primary, accent, text = "#f1f5f9"] = palette; const [fontHead, fontBody] = fonts; return `Diretrizes visuais sugeridas:\n- Paleta (hex): BG ${bgc} | Primária ${primary} | Acento ${accent} | Texto ${text}\n- Tipografia (Google Fonts): Títulos "${fontHead}", Corpo "${fontBody}"\n- Background: ${bg}\n- Ícones sugeridos: ${(pack.icons || ["⭐"]).join(" ")}\n- CTA sugerido: "${pick(pack.ctas || ["Patrocinar agora"])}"\n(OBS: Alterne hero, proporções e grade a cada geração.)`.trim(); }
async function ensureBackground(modalidade: string): Promise<string | null> { if (getApps().length === 0) { initializeApp(); } try { const bucket = getStorage().bucket(); const slug = slugify(modalidade) || "bg"; const path = `backgrounds/${slug}.jpg`; const file = bucket.file(path); const [exists] = await file.exists(); if (exists) { return `https://storage.googleapis.com/${bucket.name}/${path}`; } const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() }); const prompt = `Background fotográfico temático de ${modalidade}, estilo “cine still”...`.trim(); const img = await openai.images.generate({ model: "dall-e-3", prompt, size: "1792x1024", quality: "hd", n: 1, response_format: "b64_json", }); const b64 = img.data?.[0]?.b64_json; if (!b64) throw new Error("Falha ao gerar imagem (b64 vazio)."); const buffer = Buffer.from(b64, "base64"); await file.save(buffer, { contentType: "image/jpeg", metadata: { cacheControl: "public,max-age=31536000,immutable" }, }); await file.makePublic(); return `https://storage.googleapis.com/${bucket.name}/${path}`; } catch (err: any) { logger.warn(`ensureBackground falhou: ${err?.message || err}`); return null; } }
const PROMPT_BASIC_SYSTEM = `...`.trim();
const PROMPT_PLUS_SYSTEM = `...`.trim();
const PROMPT_PREM_SYSTEM = `...`.trim();
const PROMPT_PRO_SYSTEM = PROMPT_PREM_SYSTEM;
function systemFor(plano: string) { if (plano === "plus") return PROMPT_PLUS_SYSTEM; if (plano === "premium" || plano === "pro") return PROMPT_PREM_SYSTEM; return PROMPT_BASIC_SYSTEM; }
function userFor(p: Payload, v: number) { const common = `...`; if (p.plano === "premium" || p.plano === "pro" || p.plano === "plus") { return `${common}\n- Imagens Extras (Galeria de URLs): ${(p.imagensExtra ?? []).join(", ") || "(sem extras)"}`.trim(); } return common; }
function variantId() { return Math.floor(Math.random() * 1_000_000); }
function heroShellHTML(titleFont: string, bodyFont: string, p: Payload, useParallax = false) { return `...`; }
function fallbackBasic(p: Payload) { return `...`; }
function fallbackPlus(p: Payload) { return `...`; }
function fallbackPremium(p: Payload) { return `...`; }
function buildFallbackHTML(p: Payload) { if (p.plano === "premium") return fallbackPremium(p); if (p.plano === "plus") return fallbackPlus(p); return fallbackBasic(p); }
const planDetails: PlanDetails = { basic: { name: "Básico", prices: { monthly: { id: "price_1PgTrOC4n6gXn9f9rLd5YJ2r" }, annual: { id: "price_1PgTrOC4n6gXn9f9Yj5K5f3t" }, }, }, plus: { name: "Plus", prices: { monthly: { id: "price_1PgTquC4n6gXn9f9d7f3Yj0N" }, annual: { id: "price_1PgTquC4n6gXn9f9mK6gL9hJ" }, }, }, premium: { name: "Premium", prices: { monthly: { id: "price_1PgTsHC4n6gXn9f9eGkK7J8L" }, annual: { id: "price_1PgTsHC4n6gXn9f9Nl8kM2oP" }, }, }, pro: { name: "Pro", prices: { monthly: { id: "price_1PgTtgC4n6gXn9f9jK0d9L7M" }, annual: { id: "price_1PgTtgC4n6gXn9f9Hk2lO7vQ" }, }, }, };

const generateLandingFlow = ai.defineFlow(
    {
        name: "generateLandingFlow",
        inputSchema: PayloadSchema,
        outputSchema: z.object({ ok: z.boolean(), url: z.string(), id: z.string(), plano: z.enum(["basic", "plus", "premium", "pro"]), used_fallback: z.boolean(), variant: z.number(), bg_used: z.string(), }),
    },
    async (payload) => {
        if (getApps().length === 0) {
            initializeApp();
        }
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

                const rawHtml = completion.choices[0]?.message?.content || "";
                
                const match = rawHtml.match(/```html\n([\s\S]*?)\n```/);
                html = match ? match[1] : rawHtml;

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

            return { ok: true, url: publicUrl, id, plano: data.plano, used_fallback: usedFallback, variant, bg_used: data.bgImagem || "(gerado via IA)", };
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
        if (getApps().length === 0) {
            initializeApp();
        }
        try {
            const { planId, isAnnual, userId } = payload;
            const appUrl = NEXT_PUBLIC_APP_URL.value();
            const stripe = new Stripe(STRIPE_SECRET_KEY.value(), { apiVersion: '2024-06-20' });
            logger.info(`Processando checkout para planId: ${planId}, isAnnual: ${isAnnual}`);
            const planKey = planId as keyof typeof planDetails;
            const billingCycle = isAnnual ? 'annual' : 'monthly';
            const plan = planDetails[planKey];
            if (!plan) { throw new HttpsError('not-found', `Plano com a chave "${planKey}" não foi encontrado.`); }
            const priceId = plan.prices[billingCycle]?.id;
            if (!priceId) { throw new HttpsError('not-found', `Price ID não encontrado para o plano: ${planId} (${billingCycle}).`); }
            const db = getFirestore();
            const userDoc = await db.collection('users').doc(userId).get();
            const user = userDoc.data();
            let customerId = user?.stripeCustomerId;
            if (!customerId) {
                const customer = await stripe.customers.create({ metadata: { firebaseUID: userId, }, });
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
                metadata: { userId: userId, planId: planId, billingCycle: billingCycle, }
            });
            if (!session.url) { throw new HttpsError('internal', 'A sessão de checkout do Stripe foi criada, mas não contém uma URL.'); }
            return { url: session.url };
        } catch (error: any) {
            logger.error('Erro ao criar a sessão de checkout do Stripe:', error);
            if (error instanceof Stripe.errors.StripeError) { throw new HttpsError('internal', `Erro do Stripe: ${error.message}`); }
            throw new HttpsError('internal', `Falha ao criar a sessão de checkout do Stripe: ${error.message}`);
        }
    }
);

export const generateLanding = onCall(
    { memory: '1GiB', region: "southamerica-east1", timeoutSeconds: 120, secrets: [OPENAI_API_KEY], cors: true },
    async (request) => {
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
            if (!signature) { logger.error("⚠️  Webhook signature verification failed."); response.status(400).send('Webhook Error: No signature header'); return; }
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
                    if (!userId || !planId || !billingCycle) { throw new Error(`checkout.session.completed missing metadata. Session ID: ${session.id}`); }
                    const userDocRef = db.collection('users').doc(userId);
                    await userDocRef.update({ planId: planId, planStatus: 'active', billingCycle: billingCycle, stripeSubscriptionId: session.subscription, });
                    logger.info(`✅ User ${userId} plan set to ${planId} (${billingCycle}) and status active.`);
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const userQuery = await db.collection('users').where('stripeSubscriptionId', '==', subscription.id).limit(1).get();
                    if (userQuery.empty) { logger.warn(`User with subscription ${subscription.id} not found.`); break; }
                    const userDoc = userQuery.docs[0];
                    await userDoc.ref.update({ planStatus: 'inactive' });
                    logger.info(`✅ User ${userDoc.id} plan set to inactive.`);
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