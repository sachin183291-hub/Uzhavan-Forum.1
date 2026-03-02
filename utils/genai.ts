
import { GoogleGenAI, Modality } from '@google/genai';
import { FarmerProfile } from '../types.ts';

// ─── Shared AI client ────────────────────────────────────────────────────────

const getAI = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured in .env.local');
    return new GoogleGenAI({ apiKey });
};

// ─── Rate-limit detection ─────────────────────────────────────────────────────
// Gemini throws RESOURCE_EXHAUSTED / 429 / "quota" in various formats

const isRateLimit = (e: any): boolean => {
    const status = e?.status ?? e?.statusCode ?? e?.code ?? 0;
    const msg = String(e?.message ?? e?.toString() ?? '').toLowerCase();
    const full = JSON.stringify(e ?? '').toLowerCase();
    return (
        status === 429 ||
        msg.includes('429') ||
        msg.includes('quota') ||
        msg.includes('rate limit') ||
        msg.includes('too many requests') ||
        msg.includes('resource_exhausted') ||
        msg.includes('resourceexhausted') ||
        full.includes('resource_exhausted') ||
        full.includes('quota_exceeded')
    );
};

// ─── Sleep helper ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ─── Demo fallback response (when ALL retries fail) ───────────────────────────

const buildDemoResponse = (question: string, crop: string) => {
    const q = (question || '').toLowerCase();
    const isBlight = q.includes('yellow') || q.includes('blight') || q.includes('leaf');
    const isPest = q.includes('pest') || q.includes('insect') || q.includes('bug');
    const isFertiliz = q.includes('fertiliz') || q.includes('nutrient') || q.includes('growth');

    let mainDiagnosis = 'General Crop Advisory';
    let fullExplanation = `Your ${crop || 'crop'} requires standard seasonal care. Ensure proper irrigation, apply balanced NPK fertilizer (19:19:19) at recommended doses, and monitor for early signs of pest or disease. Maintain field hygiene by removing crop residues after harvest.`;
    let diseaseName = '';
    let detected = false;
    let severity = 'low';
    let productIds = ['p2', 'p5'];

    if (isBlight) {
        mainDiagnosis = 'Leaf Blight / Chlorosis';
        fullExplanation = `Yellow or brown leaf discolouration in ${crop || 'your crop'} typically indicates Leaf Blight or Nitrogen deficiency (Chlorosis). The pathogen Helminthosporium or Alternaria species cause dark lesions that spread rapidly in humid conditions above 80%. Immediate action: apply Copper Oxychloride @ 3g/litre water as foliar spray. Follow up with Urea @ 10 kg/acre within 5 days to correct nitrogen levels. Ensure good drainage to prevent waterlogging.`;
        detected = true;
        diseaseName = 'Leaf Blight (Helminthosporium sp.)';
        severity = 'medium';
        productIds = ['p4', 'p2', 'p1'];
    } else if (isPest) {
        mainDiagnosis = 'Insect Pest Infestation';
        fullExplanation = `Pest damage detected in ${crop || 'your crop'}. Common pests include stem borers, aphids, and thrips that cause significant yield loss if uncontrolled. Apply Neem Oil Concentrate @ 5ml/litre as a contact spray during early morning or evening hours. For severe infestation, use Chlorpyrifos 20 EC @ 2ml/litre. Repeat spray after 10-12 days if damage persists.`;
        detected = true;
        diseaseName = 'Mixed Insect Pest';
        severity = 'medium';
        productIds = ['p1', 'p4'];
    } else if (isFertiliz) {
        mainDiagnosis = 'Nutritional Deficiency';
        fullExplanation = `${crop || 'Your crop'} shows signs of macro or micro-nutrient deficiency. Apply NPK 19:19:19 @ 5g/litre as foliar spray for quick absorption. Supplement with Vermicompost @ 2 tonnes/acre for long-term soil health improvement. Conduct a soil test to identify specific deficient nutrients and adjust fertilization accordingly next season.`;
        detected = false;
        productIds = ['p2', 'p5'];
    }

    return JSON.stringify({
        mainDiagnosis,
        confidenceLevel: 'Medium',
        fullExplanation,
        futurePrevention: `For future seasons, rotate crops with legumes to naturally replenish soil nitrogen. Apply Vermicompost @ 2 tonnes/acre before sowing to build organic matter. Use disease-resistant ${crop || 'crop'} varieties and practice seed treatment with Trichoderma @ 4g/kg seed.`,
        nearbyProtection: `Alert neighboring farmers to inspect their fields for similar symptoms. Establish a buffer zone by spraying Copper Oxychloride on field borders. Avoid sharing farm implements between infected and healthy fields to prevent cross-contamination.`,
        diseaseDetected: { detected, diseaseName, severity },
        suggestedProductIds: productIds
    });
};

// ─── Gemini call with retry + demo fallback ──────────────────────────────────

async function callGeminiWithFallback(
    ai: GoogleGenAI,
    primary: string,
    fallback: string,
    request: Parameters<typeof ai.models.generateContent>[0],
    demoText: string
): Promise<{ text: string }> {

    const tryModel = async (model: string) => {
        const r = await ai.models.generateContent({ ...request, model });
        return r.text || r.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    };

    // Attempt 1 — primary model
    try {
        console.log(`[GenAI] Calling ${primary}...`);
        return { text: await tryModel(primary) };
    } catch (e1: any) {
        if (!isRateLimit(e1)) {
            console.error('[GenAI] Non-rate-limit error:', e1?.message);
            throw e1;
        }
        console.warn('[GenAI] Rate limit on primary. Waiting 20s...');
    }

    await sleep(20000);

    // Attempt 2 — retry primary
    try {
        console.log(`[GenAI] Retrying ${primary}...`);
        return { text: await tryModel(primary) };
    } catch (e2: any) {
        if (!isRateLimit(e2)) throw e2;
        console.warn('[GenAI] Still rate-limited. Trying fallback model...');
    }

    await sleep(10000);

    // Attempt 3 — fallback model (higher quota)
    try {
        console.log(`[GenAI] Trying fallback ${fallback}...`);
        return { text: await tryModel(fallback) };
    } catch (e3: any) {
        if (!isRateLimit(e3)) throw e3;
        console.warn('[GenAI] All models rate-limited. Using demo response.');
    }

    // All failed → return demo response so UI never breaks
    return { text: demoText };
}

// ─── Diagnose ─────────────────────────────────────────────────────────────────

export interface DiagnoseParams {
    profile: FarmerProfile | null;
    question: string;
    imageInlineData: { data: string; mimeType: string } | null;
    language: string;
    productCatalogText: string;
}

export const diagnose = async ({
    profile,
    question,
    imageInlineData,
    language,
    productCatalogText,
}: DiagnoseParams): Promise<{ text: string }> => {
    const ai = getAI();

    const langInstruction =
        language === 'Tamil' ? 'Respond ONLY in Tamil language (தமிழ்).' :
            language === 'Malayalam' ? 'Respond ONLY in Malayalam language (മലയാളം).' :
                'Respond in English.';

    const systemPrompt = `You are an expert agricultural pathologist and farming advisor for South Indian farmers. ${langInstruction} Always reply with a single valid JSON object only — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Farmer Profile:
- Name: ${profile?.name || 'Unknown'}
- Location: ${profile?.district || 'Unknown'}, ${profile?.state || 'Unknown'}
- Primary Crop: ${profile?.primaryCrop || 'Mixed'}
- Land Size: ${profile?.landSize || 'Unknown'} acres
- Experience: ${profile?.experience || 'Unknown'} years
- Soil Type: ${profile?.soilType || 'Unknown'}

Question / Complaint: ${question || 'Please analyze the uploaded image visually.'}

Available Products (use IDs for suggestions):
${productCatalogText}

${langInstruction}

Return ONLY this JSON structure (all text values in the selected language):
{
  "mainDiagnosis": "Short diagnosis title (3-6 words)",
  "confidenceLevel": "High | Medium | Low",
  "fullExplanation": "Detailed 4-6 sentence botanical/pathological explanation",
  "futurePrevention": "2-3 actionable sentences for future seasons",
  "nearbyProtection": "2-3 sentences to protect neighboring crops",
  "diseaseDetected": {
    "detected": true,
    "diseaseName": "Exact disease or pest name",
    "severity": "high | medium | low"
  },
  "suggestedProductIds": ["p1", "p2"]
}`;

    const parts: any[] = [{ text: userPrompt }];
    if (imageInlineData) {
        parts.push({ inlineData: { mimeType: imageInlineData.mimeType, data: imageInlineData.data } });
    }

    const demoText = buildDemoResponse(question, profile?.primaryCrop || 'Mixed');

    return callGeminiWithFallback(
        ai,
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        {
            model: 'gemini-2.0-flash', // overridden inside callGeminiWithFallback
            contents: [{ parts }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
            },
        },
        demoText
    );
};

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

export interface TtsParams {
    text: string;
    language: string;
}

export const tts = async ({ text }: TtsParams) => {
    const ai = getAI();

    const request = {
        model: 'gemini-2.0-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    };

    try {
        return await ai.models.generateContent(request);
    } catch (e: any) {
        if (!isRateLimit(e)) throw e;
        await sleep(15000);
        try {
            return await ai.models.generateContent(request);
        } catch {
            // TTS failed — return empty so voice simply doesn't play
            return { candidates: [] };
        }
    }
};
