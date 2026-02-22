/**
 * Nutrixo AI Service Layer
 */
import supabase from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { GoogleGenAI } from '@google/genai';
import { parsePtBrNumber, parsePtBrReferenceRange } from '../lib/numberLocale';

// Usa worker local empacotado pelo Vite (evita CDN, 404 e bloqueio de CSP para fake worker/blob).
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'meta/llama-3.2-11b-vision-instruct';
const AI_FALLBACK_MODEL = import.meta.env.VITE_AI_FALLBACK_MODEL || AI_MODEL;
const IMPORT_OCR_MODEL =
    import.meta.env.VITE_IMPORT_OCR_MODEL ||
    import.meta.env.VITE_NVIDIA_IMPORT_MODEL || // compatibilidade retroativa
    AI_MODEL;
const NVIDIA_API_URL = '/nv-api/v1/chat/completions';
const IMPORT_BACKEND_API_BASE = import.meta.env.VITE_IMPORT_BACKEND_URL || '/py-api';
const IMPORT_USE_BACKEND = import.meta.env.VITE_IMPORT_USE_BACKEND !== 'false';
const ENABLE_AI_LOGGING = import.meta.env.VITE_ENABLE_AI_LOGGING === 'true';

// ============================================================
// 📊 AI LOGGING HELPER
// ============================================================
export async function logAiUsage({ userEmail, functionName, modelUsed, promptTokens = 0, completionTokens = 0, totalTokens = 0 }) {
    if (!ENABLE_AI_LOGGING) return; // Feature flag desabilitada no .env

    try {
        await supabase.from('nutrixo_ai_logs').insert([{
            user_email: userEmail || 'unknown@system.local',
            function_name: functionName,
            model_used: modelUsed,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
        }]);
    } catch (err) {
        console.warn('⚠️ [logAiUsage] Falha ao registrar log de uso da IA:', err.message);
    }
}

// ============================================================
// 🛡️ SECURITY HELPERS
// ============================================================
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function validateFile(file) {
    if (!file) throw new Error('Nenhum arquivo fornecido.');

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Arquivo muito grande. O limite é 10MB.');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Formato de arquivo não suportado. Use PDF ou Imagem.');
    }
    return true;
}

/**
 * 🛡️ Valida JWT e retorna o email do usuário autenticado (sempre em lowercase).
 * Deve ser chamada no início de toda operação que leia ou escreva dados de saúde.
 */
async function getAuthenticatedEmail() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
        throw new Error('🔒 Sessão expirada. Faça login novamente.');
    }

    // Supabase: expires_at é timestamp em segundos
    if (data.session.expires_at && new Date() > new Date(data.session.expires_at * 1000)) {
        throw new Error('🔒 Sessão expirada. Faça login novamente.');
    }

    const email = data.session.user?.email;
    if (!email) {
        throw new Error('🔒 Usuário sem email identificado na sessão.');
    }

    // Normalizamos para lowercase para evitar quebras de RLS por case-sensitivity
    return email.toLowerCase();
}

function normalizeAnalysisError(error, fallbackMessage) {
    const raw = error?.message || fallbackMessage;
    const lower = raw.toLowerCase();

    if (lower.includes('invalid token') || lower.includes('sessão') || lower.includes('session')) {
        return 'Sessão inválida ou expirada. Faça login novamente.';
    }

    if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('forbidden')) {
        return 'Falha na autenticação com o serviço de IA. Verifique sua chave NVIDIA.';
    }

    // Erro de RLS no Supabase geralmente indica que a política bloqueou o insert/select
    if (lower.includes('row-level security policy') || lower.includes('rls')) {
        return '🔒 Erro de permissão: Sua conta não tem autorização para realizar esta operação no banco de dados.';
    }

    return raw;
}

// ============================================================
// 🤖 NVIDIA AI HELPER
// ============================================================
function getNvidiaApiKey() {
    const key = import.meta.env.VITE_NVIDIA_API_KEY;
    if (!key) {
        throw new Error('⚠️ VITE_NVIDIA_API_KEY não configurada. Adicione ao .env');
    }
    return key;
}

/**
 * Chamada universal à NVIDIA API
 */
async function createChatCompletion({ model = AI_MODEL, messages, stream = false, originFunction = 'unknown', userEmail = null }) {
    const apiKey = getNvidiaApiKey();

    const body = {
        model,
        messages,
        max_tokens: 4096,
        temperature: 0.2, // Mais baixo para transcrição técnica fiel
        top_p: 0.7,
        stream: stream,
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': stream ? 'text/event-stream' : 'application/json',
    };

    const response = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`NVIDIA API error (${response.status}): ${errorBody}`);
    }

    if (stream) {
        return response; // Return raw response for streaming
    }

    const jsonResponse = await response.json();

    // Dispara log assíncrono capturando as métricas
    if (jsonResponse.usage) {
        logAiUsage({
            userEmail,
            functionName: originFunction,
            modelUsed: model,
            promptTokens: jsonResponse.usage.prompt_tokens,
            completionTokens: jsonResponse.usage.completion_tokens,
            totalTokens: jsonResponse.usage.total_tokens
        });
    }

    return jsonResponse;
}

async function* streamChatCompletion(response) {
    const reader = response.body?.getReader?.();
    if (!reader) return;

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || !line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            try {
                yield JSON.parse(data);
            } catch {
                // Ignore malformed SSE line
            }
        }
    }
}

async function mapWithConcurrency(items, limit, worker) {
    if (!Array.isArray(items) || items.length === 0) return [];
    const concurrency = Math.max(1, Math.min(limit || 1, items.length));
    const results = new Array(items.length);
    let nextIndex = 0;

    const runWorker = async () => {
        while (true) {
            const current = nextIndex;
            nextIndex += 1;
            if (current >= items.length) return;
            results[current] = await worker(items[current], current);
        }
    };

    await Promise.all(Array.from({ length: concurrency }, () => runWorker()));
    return results;
}

async function createBackendImportJob(kind, file, userEmail) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_email', userEmail);

    const response = await fetch(`${IMPORT_BACKEND_API_BASE}/api/import/${kind}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Import backend error (${response.status}): ${text}`);
    }

    return await response.json();
}

async function waitBackendImportJob(kind, jobId, timeoutMs = 15 * 60 * 1000, onProgress = null) {
    const start = Date.now();
    let notFoundStreak = 0;

    while (Date.now() - start < timeoutMs) {
        const response = await fetch(`${IMPORT_BACKEND_API_BASE}/api/import/${kind}/${jobId}?t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, max-age=0',
                Pragma: 'no-cache',
            },
        });
        if (!response.ok) {
            const text = await response.text();
            if (response.status === 404) {
                notFoundStreak += 1;
                // Em restart do backend, o job pode levar alguns segundos para reaparecer via persistência.
                if (notFoundStreak <= 15) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    continue;
                }
                throw new Error('Processamento reiniciado no servidor. Recarregando status...');
            }
            throw new Error(`Import status error (${response.status}): ${text}`);
        }
        notFoundStreak = 0;

        const payload = await response.json();
        const status = String(payload?.status || '').toLowerCase();
        const stage = payload?.progress?.stage || 'queued';
        const percent = Number(payload?.progress?.percent || 0);
        console.log(`[import][${kind}] job=${jobId} status=${status} stage=${stage} percent=${percent}`);
        if (typeof onProgress === 'function') {
            onProgress(payload?.progress || { stage, percent });
        }

        if (status === 'completed') {
            return payload?.result || {};
        }

        if (status === 'failed') {
            throw new Error(payload?.error || 'Falha no processamento do backend.');
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Timeout no processamento do backend. Tente novamente.');
}

async function analyzeImportViaBackend(kind, file, userEmail, onProgress = null) {
    const created = await createBackendImportJob(kind, file, userEmail);
    if (!created?.job_id) {
        throw new Error('Backend não retornou job_id para importação.');
    }
    return await waitBackendImportJob(kind, created.job_id, 15 * 60 * 1000, onProgress);
}

// ============================================================
// 📦 SUPABASE STORAGE HELPERS
// ============================================================

/**
 * Upload file to Supabase Storage — substitui insforge.storage.from().uploadAuto()
 */
async function uploadFileToStorage(file, folder = 'files') {
    const fileExt = file.name.split('.').pop();
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

    if (error || !data?.path) {
        throw new Error(error?.message || 'Falha ao enviar arquivo para o storage.');
    }

    return data;
}

/**
 * Gera URL pública de um arquivo no Supabase Storage
 */
function getPublicUrl(filePath) {
    const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
    return data.publicUrl;
}

// ============================================================
// 📦 DATABASE HELPER
// ============================================================

/**
 * Wrapper simples para operações de DB com tratamento de erro
 */
async function dbOperation(operation) {
    const result = await operation();
    if (result.error) {
        throw new Error(result.error.message || 'Erro na operação de banco de dados');
    }
    return result;
}

// ============================================================
// 🔄 JSON PARSING HELPER
// ============================================================

function parseAIJsonResponse(responseText) {
    try {
        const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        return JSON.parse(cleaned);
    } catch {
        try {
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            } else {
                const firstBrace = responseText.indexOf('{');
                const lastBrace = responseText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                    return JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
                } else {
                    console.error('[parseAIJsonResponse] Failed to parse:', responseText.substring(0, 500));
                    return { raw: responseText };
                }
            }
        } catch {
            console.error('[parseAIJsonResponse] Final parse failure:', responseText.substring(0, 500));
            return { raw: responseText };
        }
    }
}

function normalizePlanMealEntry(meal) {
    if (!meal || typeof meal !== 'object') return null;
    return {
        time: meal.time || 'Refeição',
        name: meal.name || 'Opção Sugerida',
        calories: Number(meal.calories || 0),
        protein: Number(meal.protein || 0),
        carbs: Number(meal.carbs || 0),
        fats: Number(meal.fats || 0),
        ingredients: Array.isArray(meal.ingredients)
            ? meal.ingredients.map((item) => String(item))
            : (typeof meal.ingredients === 'string' ? [meal.ingredients] : [])
    };
}

function dedupePlanMeals(meals = []) {
    const seen = new Set();
    const deduped = [];

    meals.forEach((meal) => {
        const normalized = normalizePlanMealEntry(meal);
        if (!normalized) return;
        const key = normalizeBiomarkerToken(`${normalized.time}|${normalized.name}`);
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(normalized);
    });

    return deduped;
}

function buildFallbackMeals({ targetMeals, dailyMacros, existingMeals = [] }) {
    const slotsByCount = {
        3: ['Café da Manhã', 'Almoço', 'Jantar'],
        4: ['Café da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar'],
        5: ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar'],
        6: ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']
    };
    const slots = slotsByCount[targetMeals] || slotsByCount[4];
    const used = new Set(existingMeals.map((meal) => normalizeBiomarkerToken(meal?.time)));

    const caloriesPerMeal = Math.round(Number(dailyMacros?.calories || 0) / targetMeals) || 0;
    const proteinPerMeal = Math.round((Number(dailyMacros?.protein || 0) / targetMeals) * 10) / 10;
    const carbsPerMeal = Math.round((Number(dailyMacros?.carbs || 0) / targetMeals) * 10) / 10;
    const fatsPerMeal = Math.round((Number(dailyMacros?.fats || 0) / targetMeals) * 10) / 10;

    return slots
        .filter((slot) => !used.has(normalizeBiomarkerToken(slot)))
        .map((slot) => ({
            time: slot,
            name: `Sugestão para ${slot.toLowerCase()}`,
            calories: caloriesPerMeal,
            protein: proteinPerMeal,
            carbs: carbsPerMeal,
            fats: fatsPerMeal,
            ingredients: ['Item sugerido pela IA']
        }));
}

async function completeMissingMealsWithAI({ wizardData, currentAnalysis, targetMeals, userEmail }) {
    const currentMeals = Array.isArray(currentAnalysis?.meals) ? currentAnalysis.meals : [];
    const missingCount = Math.max(0, targetMeals - currentMeals.length);
    if (missingCount === 0) return [];

    const completion = await createChatCompletion({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um nutricionista clínico.
Complete SOMENTE as refeições faltantes para um plano alimentar já iniciado.
Retorne APENAS JSON válido no formato:
{
  "meals": [
    {
      "time": "Almoço",
      "name": "Opção de almoço",
      "calories": 500,
      "protein": 35,
      "carbs": 55,
      "fats": 16,
      "ingredients": ["Item 1", "Item 2"]
    }
  ]
}
REGRAS:
- Retorne exatamente ${missingCount} refeições.
- Não repetir refeições já existentes.
- Distribua calorias/macros de forma coerente com os macros diários.
- Sem markdown, sem texto extra.`
            },
            {
                role: 'user',
                content: JSON.stringify({
                    patient: wizardData,
                    targetMeals,
                    existingMeals: currentMeals,
                    dailyMacros: currentAnalysis?.dailyMacros || null
                })
            }
        ],
        stream: false,
        originFunction: 'completeMissingMealsWithAI',
        userEmail
    });

    const text = completion.choices?.[0]?.message?.content || '';
    const parsed = parseAIJsonResponse(text);
    const extracted = Array.isArray(parsed?.meals) ? parsed.meals : [];
    return dedupePlanMeals(extracted).slice(0, missingCount);
}

function normalizeExamName(name = '') {
    return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeBiomarkerToken(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function mergeExamAnalyses(pageAnalyses = []) {
    const mergedBiomarkers = [];
    const seen = new Set();
    const summaries = [];
    const recommendations = [];
    const alerts = [];

    pageAnalyses.forEach((analysis) => {
        const biomarkers = Array.isArray(analysis?.biomarkers) ? analysis.biomarkers : [];
        biomarkers.forEach((b) => {
            const key = `${normalizeExamName(b?.name)}|${String(b?.reference || '').trim()}`;
            if (seen.has(key)) return;
            seen.add(key);
            mergedBiomarkers.push(b);
        });

        if (analysis?.summary) summaries.push(analysis.summary);
        if (Array.isArray(analysis?.recommendations)) recommendations.push(...analysis.recommendations);
        if (Array.isArray(analysis?.alerts)) alerts.push(...analysis.alerts);
    });

    const uniq = (arr) => Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));

    return {
        biomarkers: mergedBiomarkers,
        summary: summaries.join(' ').trim(),
        recommendations: uniq(recommendations),
        alerts: uniq(alerts),
    };
}

function parseLocaleNumber(value) {
    return parsePtBrNumber(value);
}

function parseReferenceRange(value) {
    return parsePtBrReferenceRange(value);
}

function isWithinRange(value, range) {
    if (!range || value === null || Number.isNaN(value)) return false;
    const [min, max] = range;
    if (min !== null && max !== null) return value >= min && value <= max;
    if (min !== null && max === null) return value >= min;
    if (min === null && max !== null) return value <= max;
    return false;
}

function normalizeBiomarkerStatus(status) {
    const raw = String(status || '').toLowerCase();
    return ['normal', 'low', 'high'].includes(raw) ? raw : 'unknown';
}

function computeStatusByReference(value, range, fallbackStatus = 'unknown') {
    if (!range || value === null || Number.isNaN(value)) return fallbackStatus;
    const [min, max] = range;
    if (min !== null && max !== null) {
        if (value >= min && value <= max) return 'normal';
        return value < min ? 'low' : 'high';
    }
    if (min !== null && max === null) return value >= min ? 'normal' : 'low';
    if (min === null && max !== null) return value <= max ? 'normal' : 'high';
    return fallbackStatus;
}

function normalizeExamAnalysis(analysis) {
    const biomarkers = Array.isArray(analysis?.biomarkers) ? analysis.biomarkers : [];

    const normalizedBiomarkers = biomarkers.map((biomarker) => {
        const fallbackStatus = normalizeBiomarkerStatus(biomarker?.status);
        const range = parseReferenceRange(biomarker?.reference);
        const parsedValue = parseLocaleNumber(biomarker?.value);

        let normalizedValue = parsedValue;

        // Corrige casos comuns de OCR/IA no padrão BR:
        // "278.000" pode virar 278 se o ponto for interpretado como decimal.
        // Se a referência usa milhar e o valor*1000 encaixa na faixa, aplicamos correção.
        if (range && normalizedValue !== null && normalizedValue > 0 && normalizedValue < 1000) {
            const referenceText = String(biomarker?.reference || '');
            const hasThousandsInReference = /\d{1,3}[.,]\d{3}/.test(referenceText);
            const scaled = normalizedValue * 1000;
            if (hasThousandsInReference && !isWithinRange(normalizedValue, range) && isWithinRange(scaled, range)) {
                normalizedValue = scaled;
            }
        }

        const normalizedStatus = computeStatusByReference(normalizedValue, range, fallbackStatus);

        return {
            ...biomarker,
            value: normalizedValue ?? biomarker?.value,
            status: normalizedStatus,
        };
    });

    return {
        ...analysis,
        biomarkers: normalizedBiomarkers,
    };
}

function mergeMissingBiomarkersByName(primaryAnalysis, fallbackAnalysis) {
    const primaryBiomarkers = Array.isArray(primaryAnalysis?.biomarkers) ? primaryAnalysis.biomarkers : [];
    const fallbackBiomarkers = Array.isArray(fallbackAnalysis?.biomarkers) ? fallbackAnalysis.biomarkers : [];

    if (!fallbackBiomarkers.length) return primaryAnalysis;

    const existingNames = new Set(
        primaryBiomarkers
            .map((b) => normalizeExamName(b?.name))
            .filter(Boolean)
    );

    const missing = fallbackBiomarkers.filter((b) => {
        const name = normalizeExamName(b?.name);
        if (!name || existingNames.has(name)) return false;
        const val = parseLocaleNumber(b?.value);
        return val !== null && !Number.isNaN(val);
    });

    if (!missing.length) return primaryAnalysis;

    return {
        ...primaryAnalysis,
        biomarkers: [...primaryBiomarkers, ...missing],
    };
}

async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content?.items || [])
            .map((item) => String(item.str || '').trim())
            .filter(Boolean)
            .join('\n');
        pages.push(`--- Página ${i} ---\n${pageText}`);
    }

    return pages.join('\n\n');
}

const QUICK_AUDIT_BIOMARKERS = [
    'hemacias',
    'hemoglobina',
    'hematocrito',
    'leucocitos',
    'plaquetas',
    'glicose',
    'colesterol total',
    'hdl',
    'ldl',
    'triglicerideos',
    'tgo',
    'tgp',
    'creatinina',
    'ureia',
    'tsh',
    't4 livre',
    'vitamina d',
    'testosterona total',
];

function getMissingBiomarkersByQuickTextAudit(pdfText, analysis) {
    const normalizedText = normalizeBiomarkerToken(pdfText);
    if (!normalizedText) return [];

    const foundInText = QUICK_AUDIT_BIOMARKERS.filter((name) => normalizedText.includes(name));
    if (!foundInText.length) return [];

    const extracted = new Set(
        (analysis?.biomarkers || [])
            .map((b) => normalizeBiomarkerToken(b?.name))
            .filter(Boolean)
    );

    return foundInText.filter((name) => !extracted.has(name));
}

async function extractExamBiomarkersFromPdfTextFocused(pdfText, missingNames = []) {
    if (!pdfText || !missingNames.length) return null;

    const completion = await createChatCompletion({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um extrator de biomarcadores. Extraia SOMENTE os exames solicitados se existirem no texto.

Formato:
{
  "biomarkers": [
    { "name": "TSH", "value": 2.1, "unit": "µUI/mL", "reference": "0,4 - 4,0 µUI/mL", "status": "normal" }
  ]
}

REGRAS:
- Não inventar dados.
- Ponto pode ser milhar no texto BR. No JSON final, "value" numérico real.
- Se não encontrar algum dos exames solicitados, simplesmente omita.
- Retorne SOMENTE JSON.`
            },
            {
                role: 'user',
                content: `Exames prioritários faltantes: ${missingNames.join(', ')}\n\nTexto do PDF:\n${pdfText}`
            }
        ],
    });

    const responseText = completion.choices?.[0]?.message?.content || '';
    return parseAIJsonResponse(responseText);
}

const QUICK_AUDIT_MEASUREMENTS = [
    { label: 'peso', token: 'peso', keys: ['weight', 'peso'] },
    { label: 'altura', token: 'altura', keys: ['height', 'altura'] },
    { label: 'cintura', token: 'cintura', keys: ['waist', 'waist circumference', 'cintura'] },
    { label: 'quadril', token: 'quadril', keys: ['hip', 'hips', 'quadril'] },
    { label: 'gordura corporal', token: 'gordura corporal', keys: ['bodyfat', 'body fat', 'gordura corporal', 'pbf'] },
    { label: 'massa muscular', token: 'massa muscular', keys: ['musclemass', 'muscle mass', 'massa muscular', 'smm'] },
    { label: 'gordura visceral', token: 'gordura visceral', keys: ['visceralfat', 'visceral fat', 'gordura visceral'] },
];

const QUICK_AUDIT_PLAN_MEALS = [
    { slot: 'Café da Manhã', tokens: ['cafe da manha', 'café da manhã', 'desjejum'] },
    { slot: 'Almoço', tokens: ['almoco', 'almoço'] },
    { slot: 'Lanche', tokens: ['lanche'] },
    { slot: 'Jantar', tokens: ['jantar'] },
    { slot: 'Ceia', tokens: ['ceia'] },
];

function getMissingMeasurementsByQuickTextAudit(pdfText, analysis) {
    const normalizedText = normalizeBiomarkerToken(pdfText);
    if (!normalizedText) return [];

    const extractedKeys = new Set(
        Object.keys(analysis?.measurements || {}).map((key) => normalizeBiomarkerToken(key))
    );

    return QUICK_AUDIT_MEASUREMENTS.filter((signal) => {
        const textHasSignal = normalizedText.includes(normalizeBiomarkerToken(signal.token));
        if (!textHasSignal) return false;
        const hasExtracted = signal.keys.some((key) => extractedKeys.has(normalizeBiomarkerToken(key)));
        return !hasExtracted;
    }).map((signal) => signal.label);
}

async function extractMeasurementsFromPdfTextFocused(pdfText, missingLabels = []) {
    if (!pdfText || !missingLabels.length) return null;

    const completion = await createChatCompletion({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você extrai medidas corporais de texto OCR.

Retorne APENAS JSON no formato:
{
  "bmi": { "value": 28.4, "classification": "Sobrepeso" },
  "measurements": {
    "weight": { "value": 94.2, "unit": "kg" }
  }
}

REGRAS:
- Extraia SOMENTE os itens solicitados.
- Não invente dados.
- Use valor numérico correto no padrão pt-BR convertido para número.
- Se não encontrar um item solicitado, omita.`
            },
            {
                role: 'user',
                content: `Itens faltantes prioritários: ${missingLabels.join(', ')}\n\nTexto do PDF:\n${pdfText}`
            }
        ],
        originFunction: 'extractMeasurementsFromPdfTextFocused',
        userEmail: null
    });

    const responseText = completion.choices?.[0]?.message?.content || '';
    return parseAIJsonResponse(responseText);
}

function getMissingPlanByQuickTextAudit(pdfText, analysis) {
    const normalizedText = normalizeBiomarkerToken(pdfText);
    if (!normalizedText) return { missingMeals: [], missingMacros: false };

    const extractedMealText = (analysis?.meals || [])
        .map((meal) => normalizeBiomarkerToken(`${meal?.time || ''} ${meal?.name || ''}`))
        .join(' ');

    const missingMeals = QUICK_AUDIT_PLAN_MEALS.filter((slotDef) => {
        const appearsInText = slotDef.tokens.some((token) => normalizedText.includes(normalizeBiomarkerToken(token)));
        if (!appearsInText) return false;
        const alreadyExtracted = slotDef.tokens.some((token) => extractedMealText.includes(normalizeBiomarkerToken(token)));
        return !alreadyExtracted;
    }).map((slotDef) => slotDef.slot);

    const hasMacroHints = ['kcal', 'calorias', 'proteina', 'proteína', 'carboidrato', 'carboidratos', 'gordura', 'gorduras']
        .some((token) => normalizedText.includes(normalizeBiomarkerToken(token)));
    const hasDailyMacros = analysis?.dailyMacros && Object.keys(analysis.dailyMacros).length > 0;

    return {
        missingMeals,
        missingMacros: hasMacroHints && !hasDailyMacros,
    };
}

async function extractNutritionPlanFromPdfTextFocused(pdfText, missingMeals = [], includeMacros = false) {
    if (!pdfText || (!missingMeals.length && !includeMacros)) return null;

    const completion = await createChatCompletion({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você extrai plano alimentar de texto OCR.

Retorne APENAS JSON no formato:
{
  "dailyMacros": { "calories": 2000, "protein": 120, "carbs": 250, "fats": 65 },
  "meals": [{ "time": "Almoço", "name": "Nome", "calories": 400, "protein": 25, "carbs": 50, "fats": 12, "ingredients": [] }]
}

REGRAS:
- Extraia SOMENTE refeições solicitadas e/ou macros diários solicitados.
- Não invente dados.
- Se não encontrar algo, omita.
- Responda somente JSON.`
            },
            {
                role: 'user',
                content: `Refeições faltantes: ${missingMeals.join(', ') || 'nenhuma'}\nExtrair macros diários: ${includeMacros ? 'sim' : 'não'}\n\nTexto do PDF:\n${pdfText}`
            }
        ],
    });

    const responseText = completion.choices?.[0]?.message?.content || '';
    return parseAIJsonResponse(responseText);
}

function mergeMeasurementsAnalyses(pageAnalyses = []) {
    const merged = {
        bmi: null,
        measurements: {},
        summary: '',
        recommendations: [],
    };

    pageAnalyses.forEach((analysis) => {
        if (!merged.bmi && analysis?.bmi) {
            merged.bmi = analysis.bmi;
        }

        const currentMeasurements = analysis?.measurements || {};
        Object.keys(currentMeasurements).forEach((key) => {
            if (!merged.measurements[key]) {
                merged.measurements[key] = currentMeasurements[key];
            }
        });

        if (analysis?.summary) {
            merged.summary = `${merged.summary} ${analysis.summary}`.trim();
        }

        if (Array.isArray(analysis?.recommendations)) {
            merged.recommendations.push(...analysis.recommendations);
        }
    });

    merged.recommendations = Array.from(new Set(merged.recommendations.map((x) => String(x).trim()).filter(Boolean)));
    return merged;
}

function mergeMeasurementsAudit(primaryAnalysis, auditAnalysis) {
    if (!auditAnalysis) return primaryAnalysis;
    const merged = mergeMeasurementsAnalyses([primaryAnalysis, auditAnalysis]);
    return {
        ...primaryAnalysis,
        bmi: primaryAnalysis?.bmi || merged?.bmi || null,
        measurements: merged?.measurements || primaryAnalysis?.measurements || {},
    };
}

function mergeNutritionPlanAnalyses(pageAnalyses = []) {
    const merged = {
        dailyMacros: {},
        meals: [],
        summary: '',
        suggestions: [],
    };

    pageAnalyses.forEach((analysis) => {
        if (analysis?.dailyMacros && Object.keys(merged.dailyMacros).length === 0) {
            merged.dailyMacros = analysis.dailyMacros;
        }

        if (Array.isArray(analysis?.meals)) {
            merged.meals.push(...analysis.meals);
        }

        if (analysis?.summary) {
            merged.summary = `${merged.summary} ${analysis.summary}`.trim();
        }

        if (Array.isArray(analysis?.suggestions)) {
            merged.suggestions.push(...analysis.suggestions);
        }
    });

    merged.suggestions = Array.from(new Set(merged.suggestions.map((x) => String(x).trim()).filter(Boolean)));
    return merged;
}

function mergeNutritionPlanAudit(primaryAnalysis, auditAnalysis) {
    if (!auditAnalysis) return primaryAnalysis;
    const primaryMeals = Array.isArray(primaryAnalysis?.meals) ? primaryAnalysis.meals : [];
    const auditMeals = Array.isArray(auditAnalysis?.meals) ? auditAnalysis.meals : [];

    const seen = new Set(
        primaryMeals.map((meal) => normalizeBiomarkerToken(`${meal?.time || ''}|${meal?.name || ''}`))
    );

    const missingMeals = auditMeals.filter((meal) => {
        const key = normalizeBiomarkerToken(`${meal?.time || ''}|${meal?.name || ''}`);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const hasPrimaryMacros = primaryAnalysis?.dailyMacros && Object.keys(primaryAnalysis.dailyMacros).length > 0;
    const hasAuditMacros = auditAnalysis?.dailyMacros && Object.keys(auditAnalysis.dailyMacros).length > 0;

    return {
        ...primaryAnalysis,
        dailyMacros: hasPrimaryMacros ? primaryAnalysis.dailyMacros : (hasAuditMacros ? auditAnalysis.dailyMacros : {}),
        meals: [...primaryMeals, ...missingMeals],
    };
}

/**
 * Converte um arquivo PDF em uma lista de strings Base64 (uma para cada página)
 */
async function convertPdfToImages(file) {
    console.log('📄 [DEBUG] Iniciando conversão de PDF para Imagem...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const images = [];

        for (let i = 1; i <= numPages; i++) {
            console.log(`📸 [DEBUG] Renderizando página ${i} de ${numPages}...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // 2x para melhor OCR

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            images.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        return images;
    } catch (err) {
        console.error('❌ [PDF_CONVERSION_ERROR]:', err);
        throw new Error(`Falha técnica ao processar PDF: ${err.message}. Tente usar uma foto.`);
    }
}

async function markAnalysisAsFailed(table, id, userEmail, message) {
    try {
        await supabase
            .from(table)
            .update({
                status: 'failed',
                analysis: { error: message },
            })
            .eq('id', id)
            .eq('user_email', userEmail);
    } catch {
        // Não interrompe o fluxo principal se falhar ao marcar erro.
    }
}

async function generateFoodAnalysisFromText(text, mealType) {
    const completion = await createChatCompletion({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um nutricionista. O usuário descreve o que comeu em texto livre. Identifique os alimentos e estime os valores nutricionais. Retorne JSON:
{
  "foods": [
    { "name": "Frango grelhado", "portion": "150g", "calories": 248, "protein": 46, "carbs": 0, "fats": 5 }
  ],
  "totalCalories": 500,
  "totalProtein": 52,
  "totalCarbs": 60,
  "totalFats": 12,
  "description": "Descrição resumida da refeição",
  "healthScore": 8,
  "tips": "Dica nutricional"
}
Retorne APENAS o JSON.`
            },
            {
                role: 'user',
                content: `Para o ${mealType}, eu comi: ${text}`,
            },
        ],
    });

    const responseText = completion.choices[0].message.content;
    return parseAIJsonResponse(responseText);
}

// ============================================================
// 🧪 EXAMS - Analyze blood test PDFs
// ============================================================
export async function analyzeExam(file, options = {}) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    if (IMPORT_USE_BACKEND) {
        try {
            const backendResult = await analyzeImportViaBackend('exams', file, userEmail, options?.onProgress);
            if (typeof options?.onProgress === 'function') {
                options.onProgress({ stage: 'completed', percent: 100 });
            }
            return {
                id: backendResult?.id || null,
                analysis: backendResult?.analysis || {},
            };
        } catch (error) {
            const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar o exame no backend.');
            throw new Error(normalizedError);
        }
    }

    const uploadData = await uploadFileToStorage(file, 'exams');
    const fileUrl = getPublicUrl(uploadData.path);

    // 2. Prepare images for AI (Convert if PDF, use directly if image)
    let images = [];
    if (file.type === 'application/pdf') {
        images = await convertPdfToImages(file);
    } else {
        const singleBase64 = await fileToBase64(file);
        images = [singleBase64];
    }

    const { data: examRecord } = await dbOperation(() =>
        supabase
            .from('nutrixo_exams')
            .insert([{
                user_email: userEmail.trim().toLowerCase(),
                file_name: file.name,
                file_url: fileUrl,
                file_key: uploadData.path,
                status: 'analyzing',
            }])
            .select()
            .single()
    );

    try {
        // 3. Analyze with AI via NVIDIA API
        console.log('🔍 [DEBUG] Import OCR Model:', IMPORT_OCR_MODEL);
        console.log('🔍 [DEBUG] Enviando', images.length, 'página(s) para análise (1 por requisição)...');

        const messages = [
            {
                role: 'system',
                content: `Você é um transcritor de exames laboratoriais de elite. Sua ÚNICA tarefa é copiar os dados EXATAMENTE como estão nas tabelas do documento.

REGRA #1 — SOMENTE DADOS VISÍVEIS:
- Extraia APENAS as linhas que aparecem nas TABELAS do documento
- Cada LINHA de tabela com coluna "Exame", "Resultado" e "Valor de Referência" = 1 biomarcador
- NÃO calcule, NÃO derive, NÃO infira nenhum dado que não esteja EXPLICITAMENTE escrito
- Se um exame NÃO tem uma linha na tabela com resultado numérico, NÃO o inclua

REGRA #2 — PROIBIDO INVENTAR:
- NÃO adicione exames que não existem nas tabelas
- Se o documento tem 10 linhas de resultado, retorne EXATAMENTE 10 biomarcadores

REGRA #3 — NÚMEROS BRASILEIROS:
- No Brasil, o PONTO é separador de milhar: "7.200" = 7200
- A VÍRGULA é separador decimal: "4,92" = 4.92
- No JSON final, envie o valor numérico real sem separador de milhar: ex. "278.000" deve virar 278000 (NUNCA 278)

Formato de resposta JSON:
{
  "biomarkers": [
    { "name": "Hemácias", "value": 4.92, "unit": "milhões/mm³", "reference": "4,5 – 5,9 milhões/mm³", "status": "normal" }
  ],
  "summary": "Resumo geral em português",
  "recommendations": ["Recomendação 1"],
  "alerts": ["Alerta se houver valor fora da faixa"]
}

Status: "normal" se dentro da referência, "low" se abaixo, "high" se acima.
Retorne SOMENTE o JSON. Sem markdown, sem backticks.`
            },
        ];

        const pageAnalyses = await mapWithConcurrency(images, 2, async (image, index) => {
            const pageMessages = [
                ...messages,
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Transcreva SOMENTE a página ${index + 1}/${images.length} deste exame. NÃO invente dados.`,
                        },
                        {
                            type: 'image_url',
                            image_url: { url: image },
                        },
                    ],
                },
            ];

            const completion = await createChatCompletion({
                model: IMPORT_OCR_MODEL,
                messages: pageMessages,
                originFunction: 'analyzeExam',
                userEmail
            });
            const responseText = completion.choices[0].message.content;
            return parseAIJsonResponse(responseText);
        });

        let analysis = normalizeExamAnalysis(mergeExamAnalyses(pageAnalyses));

        // Camada de segurança para PDFs:
        // auditoria rápida por texto e IA focada somente quando houver indício de biomarcador faltante.
        if (file.type === 'application/pdf') {
            try {
                const pdfText = await extractPdfText(file);
                const missingByAudit = getMissingBiomarkersByQuickTextAudit(pdfText, analysis);

                if (missingByAudit.length > 0) {
                    const focusedAudit = await extractExamBiomarkersFromPdfTextFocused(pdfText, missingByAudit);
                    if (Array.isArray(focusedAudit?.biomarkers) && focusedAudit.biomarkers.length > 0) {
                        analysis = normalizeExamAnalysis(mergeMissingBiomarkersByName(analysis, focusedAudit));
                    }
                }
            } catch (auditErr) {
                // Não quebra a análise principal se a auditoria textual falhar.
                console.warn('[EXAM_TEXT_AUDIT] Falhou auditoria de complementação:', auditErr?.message || auditErr);
            }
        }

        console.log('🔍 [DEBUG] Análise parseada:', analysis);

        // 4. Update DB with results
        await dbOperation(() => supabase
            .from('nutrixo_exams')
            .update({ analysis, status: 'completed' })
            .eq('id', examRecord.id)
            .eq('user_email', userEmail));

        return { id: examRecord.id, analysis };
    } catch (error) {
        const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar o exame.');
        await markAnalysisAsFailed('nutrixo_exams', examRecord.id, userEmail, normalizedError);
        throw new Error(normalizedError);
    }
}

// ============================================================
// 📏 MEASUREMENTS - Analyze body measurement PDFs
// ============================================================
export async function analyzeMeasurements(file, options = {}) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    if (IMPORT_USE_BACKEND) {
        try {
            const backendResult = await analyzeImportViaBackend('measurements', file, userEmail, options?.onProgress);
            if (typeof options?.onProgress === 'function') {
                options.onProgress({ stage: 'completed', percent: 100 });
            }
            return {
                id: backendResult?.id || null,
                analysis: backendResult?.analysis || {},
            };
        } catch (error) {
            const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar as medidas no backend.');
            throw new Error(normalizedError);
        }
    }

    const uploadData = await uploadFileToStorage(file, 'measurements');
    const fileUrl = getPublicUrl(uploadData.path);
    let images = [];
    if (file.type === 'application/pdf') {
        images = await convertPdfToImages(file);
    } else {
        images = [await fileToBase64(file)];
    }

    const { data: record } = await dbOperation(() =>
        supabase
            .from('nutrixo_measurements')
            .insert([{
                user_email: userEmail,
                file_name: file.name,
                file_url: fileUrl,
                file_key: uploadData.path,
                status: 'analyzing',
            }])
            .select()
            .single()
    );

    try {
        const messages = [
            {
                role: 'system',
                content: `Você é um robô de extração de dados antropométricos. Analise o PDF e gere um JSON RÍGIDO.

ESTRUTURA OBRIGATÓRIA:
{
  "bmi": { "value": 28.4, "classification": "Sobrepeso" },
  "measurements": {
    "weight": { "value": 94.2, "unit": "kg" },
    "height": { "value": 182, "unit": "cm" },
    "waist": { "value": 98, "unit": "cm" },
    "bodyFat": { "value": 19, "unit": "%" },
    "visceralFat": { "value": 12, "unit": "level" },
    "muscleMass": { "value": 42, "unit": "kg" }
    // Extraia TODAS as circunferências (armRight, armLeft, thighRight, thighLeft, chest, abdomen, hip, etc)
    // Siga SEMPRE o padrão: "chave": { "value": numero, "unit": "unidade" }
  },
  "summary": "Resumo em Português",
  "recommendations": ["Sugestão em Português"]
}

REGRAS:
1. Varra TODOS os perímetros, circunferências e dados de composição corporal.
2. Nomes de chaves em camelCase (ex: armRightContracted, calfLeft).
3. Use PONTO para decimais.
4. OMITA a chave se não encontrar o dado no documento.
5. Se o dado existir, ele DEVE estar no objeto "measurements".
6. Retorne APENAS o JSON válido.`
            },
        ];

        const pageAnalyses = await mapWithConcurrency(images, 2, async (image, index) => {
            const pageMessages = [
                ...messages,
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Analise a página ${index + 1}/${images.length} e retorne o JSON no formato solicitado.` },
                        {
                            type: 'image_url',
                            image_url: { url: image },
                        },
                    ],
                },
            ];

            const completion = await createChatCompletion({
                model: IMPORT_OCR_MODEL,
                messages: pageMessages,
                originFunction: 'analyzeMeasurements',
                userEmail
            });

            const responseText = completion.choices[0].message.content;
            return parseAIJsonResponse(responseText);
        });
        let analysis = mergeMeasurementsAnalyses(pageAnalyses);

        if (file.type === 'application/pdf') {
            try {
                const pdfText = await extractPdfText(file);
                const missingByAudit = getMissingMeasurementsByQuickTextAudit(pdfText, analysis);
                if (missingByAudit.length > 0) {
                    const focusedAudit = await extractMeasurementsFromPdfTextFocused(pdfText, missingByAudit);
                    analysis = mergeMeasurementsAudit(analysis, focusedAudit);
                }
            } catch (auditErr) {
                console.warn('[MEASUREMENTS_TEXT_AUDIT] Falhou auditoria de complementação:', auditErr?.message || auditErr);
            }
        }

        await dbOperation(() => supabase
            .from('nutrixo_measurements')
            .update({ analysis, status: 'completed' })
            .eq('id', record.id)
            .eq('user_email', userEmail));

        return { id: record.id, analysis };
    } catch (error) {
        const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar as medidas.');
        await markAnalysisAsFailed('nutrixo_measurements', record.id, userEmail, normalizedError);
        throw new Error(normalizedError);
    }
}

// ============================================================
// 📋 NUTRITION PLAN - Analyze and generate recipes
// ============================================================
export async function analyzeNutritionPlan(file, options = {}) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    if (IMPORT_USE_BACKEND) {
        try {
            const backendResult = await analyzeImportViaBackend('plans', file, userEmail, options?.onProgress);
            if (typeof options?.onProgress === 'function') {
                options.onProgress({ stage: 'completed', percent: 100 });
            }
            return {
                id: backendResult?.id || null,
                analysis: backendResult?.analysis || {},
            };
        } catch (error) {
            const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar o plano no backend.');
            throw new Error(normalizedError);
        }
    }

    const uploadData = await uploadFileToStorage(file, 'plans');
    const fileUrl = getPublicUrl(uploadData.path);
    let images = [];
    if (file.type === 'application/pdf') {
        images = await convertPdfToImages(file);
    } else {
        images = [await fileToBase64(file)];
    }

    const { data: record } = await dbOperation(() =>
        supabase
            .from('nutrixo_plans')
            .insert([{
                user_email: userEmail,
                file_name: file.name,
                file_url: fileUrl,
                file_key: uploadData.path,
                status: 'analyzing',
            }])
            .select()
            .single()
    );

    try {
        const messages = [
            {
                role: 'system',
                content: `Você é um nutricionista. Analise o plano alimentar do PDF e retorne um JSON:
{
  "dailyMacros": {
    "calories": 2000,
    "protein": 120,
    "carbs": 250,
    "fats": 65
  },
  "meals": [
    {
      "time": "Manhã",
      "name": "Nome da refeição",
      "calories": 400,
      "protein": 25,
      "carbs": 50,
      "fats": 12,
      "ingredients": ["Ingrediente 1 - 100g", "Ingrediente 2 - 50g"]
    }
  ],
  "summary": "Resumo do plano alimentar",
  "suggestions": ["Sugestão de melhoria 1", "Sugestão 2"]
}
Retorne APENAS o JSON.`
            },
        ];

        const pageAnalyses = await mapWithConcurrency(images, 2, async (image, index) => {
            const pageMessages = [
                ...messages,
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Analise a página ${index + 1}/${images.length} do plano alimentar e retorne o JSON solicitado.` },
                        {
                            type: 'image_url',
                            image_url: { url: image },
                        },
                    ],
                },
            ];

            const completion = await createChatCompletion({
                model: IMPORT_OCR_MODEL,
                messages: pageMessages,
                originFunction: 'analyzeNutritionPlan',
                userEmail
            });

            const responseText = completion.choices[0].message.content;
            return parseAIJsonResponse(responseText);
        });
        let analysis = mergeNutritionPlanAnalyses(pageAnalyses);

        if (file.type === 'application/pdf') {
            try {
                const pdfText = await extractPdfText(file);
                const { missingMeals, missingMacros } = getMissingPlanByQuickTextAudit(pdfText, analysis);
                if (missingMeals.length > 0 || missingMacros) {
                    const focusedAudit = await extractNutritionPlanFromPdfTextFocused(pdfText, missingMeals, missingMacros);
                    analysis = mergeNutritionPlanAudit(analysis, focusedAudit);
                }
            } catch (auditErr) {
                console.warn('[PLAN_TEXT_AUDIT] Falhou auditoria de complementação:', auditErr?.message || auditErr);
            }
        }

        await dbOperation(() => supabase
            .from('nutrixo_plans')
            .update({ analysis, status: 'completed' })
            .eq('id', record.id)
            .eq('user_email', userEmail));

        return { id: record.id, analysis };
    } catch (error) {
        const normalizedError = normalizeAnalysisError(error, 'Erro ao analisar o plano alimentar.');
        await markAnalysisAsFailed('nutrixo_plans', record.id, userEmail, normalizedError);
        throw new Error(normalizedError);
    }
}

// ============================================================
// 🔮 AI DIET GENERATOR WIZARD
// ============================================================
export async function generateNutritionPlanByAI(wizardData, options = {}) {
    const { onProgress } = options;
    const userEmail = await getAuthenticatedEmail();
    const targetMeals = Math.max(3, Math.min(6, Number(wizardData?.mealCount || 4)));

    if (onProgress) onProgress({ stage: 'queued', percent: 10 });

    try {
        if (onProgress) onProgress({ stage: 'llm', percent: 40 });

        const systemMessage = {
            role: 'system',
            content: `Você é um nutricionista clínico de altíssimo nível. Foi solicitado para você criar um planejamento alimentar seguro e personalizado para um paciente.

INFORMAÇÕES DO PACIENTE:
- Idade: ${wizardData.age || 'Não informada'}
- Sexo: ${wizardData.gender || 'Não informado'}
- Altura: ${wizardData.height ? wizardData.height + ' cm' : 'Não informada'}
- Peso: ${wizardData.weight ? wizardData.weight + ' kg' : 'Não informado'}
- Nível de Atividade: ${wizardData.activityLevel || 'Não informado'}
- Objetivo: ${wizardData.goal || 'Manutenção'}
- Restrições/Alergias: ${wizardData.restrictions?.length ? wizardData.restrictions.join(', ') : 'Nenhuma'}
- Aversões: ${wizardData.aversions || 'Nenhuma'}
- Orçamento da dieta: ${wizardData.budget || 'Padrão'}
- Quantidade de refeições pedidas: ${targetMeals}

OBJETIVO:
Crie um plano alimentar completo que respeite RIGOROSAMENTE essas características. Calcule o metabolismo basal aproximado (TMB) e adicione o fator de atividade e superávit/déficit para encontrar as calorias diárias totais e os macronutrientes ideais. Divida essas calorias pelas refeições solicitadas.

Retorne APENAS um JSON VÁLIDO e mais nada, sem blocos de código markdown ou explicações. Obrigatório:
- O array "meals" deve conter EXATAMENTE ${targetMeals} refeições.
- Não retornar apenas café da manhã.
- Distribuir as refeições em horários realistas (ex: café, lanche manhã, almoço, lanche tarde, jantar, ceia quando aplicável).

Formato EXATO:
{
  "summary": "Resumo clinico explicativo sobre o plano montado, o porquê destas calorias e dicas para alcançar o objetivo",
  "dailyMacros": { "calories": 2000, "protein": 150, "carbs": 200, "fats": 66 },
  "meals": [
    { 
      "time": "Café da Manhã", 
      "name": "Opções de Desjejum", 
      "calories": 400, 
      "protein": 30, 
      "carbs": 40, 
      "fats": 13, 
      "ingredients": [
        "Opção 1: 3 ovos mexidos com 2 fatias de pão de forma", 
        "Opção 2: 150g de iogurte natural + 30g de whey + 1 banana"
      ] 
    }
  ],
  "suggestions": [
    "Beba pelo menos 3L de água",
    "Durma bem"
  ],
  "mealCount": ${targetMeals}
}`
        };

        const completion = await createChatCompletion({
            model: AI_MODEL,
            messages: [systemMessage],
            stream: false,
            originFunction: 'generateNutritionPlanByAI',
            userEmail
        });

        const responseText = completion.choices?.[0]?.message?.content || '';
        const analysis = parseAIJsonResponse(responseText);

        if (!analysis || typeof analysis !== 'object') {
            throw new Error('A inteligência artificial retornou um formato inválido. Por favor, tente novamente.');
        }

        // Normalize the payload to prevent frontend React crashes (map is not a function etc)
        let normalizedAnalysis = {
            summary: typeof analysis.summary === 'string' ? analysis.summary : 'Plano alimentar personalizado.',
            suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
            dailyMacros: {
                calories: analysis.dailyMacros?.calories || 0,
                protein: analysis.dailyMacros?.protein || 0,
                carbs: analysis.dailyMacros?.carbs || 0,
                fats: analysis.dailyMacros?.fats || 0,
            },
            meals: Array.isArray(analysis.meals) ? dedupePlanMeals(analysis.meals) : []
        };

        if (normalizedAnalysis.meals.length < targetMeals) {
            const extraMeals = await completeMissingMealsWithAI({
                wizardData,
                currentAnalysis: normalizedAnalysis,
                targetMeals,
                userEmail
            });
            normalizedAnalysis = {
                ...normalizedAnalysis,
                meals: dedupePlanMeals([...normalizedAnalysis.meals, ...extraMeals]).slice(0, targetMeals)
            };
        }

        if (normalizedAnalysis.meals.length < targetMeals) {
            const fallbackMeals = buildFallbackMeals({
                targetMeals,
                dailyMacros: normalizedAnalysis.dailyMacros,
                existingMeals: normalizedAnalysis.meals
            });
            normalizedAnalysis = {
                ...normalizedAnalysis,
                meals: dedupePlanMeals([...normalizedAnalysis.meals, ...fallbackMeals]).slice(0, targetMeals)
            };
        }

        if (normalizedAnalysis.meals.length === 0) {
            throw new Error('O plano gerado está vazio. Por favor, tente novamente para novas opções.');
        }

        if (onProgress) onProgress({ stage: 'save', percent: 80 });

        const { data: record, error: dbError } = await dbOperation(() => supabase
            .from('nutrixo_plans')
            .insert([{
                user_email: userEmail,
                file_name: 'Plano Gerado por IA',
                file_url: null,
                file_key: null,
                status: 'completed',
                analysis: normalizedAnalysis
            }])
            .select()
            .single()
        );

        if (dbError) throw dbError;

        if (onProgress) onProgress({ stage: 'completed', percent: 100 });
        return { id: record.id, analysis: normalizedAnalysis };

    } catch (error) {
        const normalized = normalizeAnalysisError(error, 'Erro ao gerar o plano com IA.');
        throw new Error(normalized);
    }
}

export async function importGeneratedPlanToNutritionPlan(planAnalysis, options = {}) {
    const { existingPlanId = null, fileName = 'Plano Importado da IA' } = options;
    const userEmail = await getAuthenticatedEmail();
    const meals = Array.isArray(planAnalysis?.meals) ? dedupePlanMeals(planAnalysis.meals) : [];

    if (meals.length === 0) {
        throw new Error('Nenhuma refeição válida encontrada para importação.');
    }

    const normalizedAnalysis = {
        summary: typeof planAnalysis?.summary === 'string' ? planAnalysis.summary : 'Plano alimentar importado.',
        suggestions: Array.isArray(planAnalysis?.suggestions) ? planAnalysis.suggestions : [],
        dailyMacros: {
            calories: Number(planAnalysis?.dailyMacros?.calories || 0),
            protein: Number(planAnalysis?.dailyMacros?.protein || 0),
            carbs: Number(planAnalysis?.dailyMacros?.carbs || 0),
            fats: Number(planAnalysis?.dailyMacros?.fats || 0),
        },
        meals
    };

    if (existingPlanId) {
        const { data, error } = await supabase
            .from('nutrixo_plans')
            .update({
                analysis: normalizedAnalysis,
                status: 'completed',
                file_name: fileName
            })
            .eq('id', existingPlanId)
            .eq('user_email', userEmail)
            .select('id')
            .single();

        if (error) throw new Error(error.message || 'Erro ao atualizar plano alimentar importado.');
        return { id: data.id, created: false, updated: true };
    }

    const { data, error } = await supabase
        .from('nutrixo_plans')
        .insert([{
            user_email: userEmail,
            file_name: fileName,
            file_url: null,
            file_key: null,
            status: 'completed',
            analysis: normalizedAnalysis
        }])
        .select('id')
        .single();

    if (error) throw new Error(error.message || 'Erro ao importar plano alimentar.');

    return { id: data.id, created: true, updated: false };
}

// ============================================================
// 📸 FOOD - Analyze food photo with AI Vision
// ============================================================
export async function analyzeFoodPhoto(file, mealType) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    // Convert file to base64 for vision
    const base64 = await fileToBase64(file);
    // Remover o prefixo data:image/...;base64,
    const base64Data = base64.split(',')[1];
    const mimeType = file.type;

    // Upload photo to storage
    const uploadData = await uploadFileToStorage(file, 'meals');
    const fileUrl = getPublicUrl(uploadData.path);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY não configurada no .env');
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Você é um nutricionista que analisa fotos de refeições. Identifique os alimentos na foto e estime os valores nutricionais com base no seu conhecimento, mas sempre force o retorno final SOMENTE no formato JSON especificado. Não inclua Markdown como \`\`\`json ou texto extra na resposta, quero APENAS o JSON válido. Exemplo de retorno esperado:
{
  "foods": [
    { "name": "Arroz branco", "portion": "150g", "calories": 195, "protein": 4, "carbs": 43, "fats": 0.4 }
  ],
  "totalCalories": 500,
  "totalProtein": 30,
  "totalCarbs": 60,
  "totalFats": 15,
  "description": "Descrição curta da refeição",
  "healthScore": 7,
  "tips": "Dica nutritional breve"
}`;

    const promptText = `Esta é uma foto do meu ${mealType}. Identifique os alimentos e estime as calorias.`;

    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            promptText,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                }
            }
        ],
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2
        }
    });

    const responseText = aiResponse.text;
    const analysis = parseAIJsonResponse(responseText);

    // Save memory tokens
    if (aiResponse.usageMetadata) {
        logAiUsage({
            userEmail,
            functionName: 'analyzeFoodPhoto',
            modelUsed: 'gemini-2.5-flash',
            promptTokens: aiResponse.usageMetadata.promptTokenCount,
            completionTokens: aiResponse.usageMetadata.candidatesTokenCount,
            totalTokens: aiResponse.usageMetadata.totalTokenCount
        });
    }

    // Save meal to DB
    const { data: meal } = await dbOperation(() => supabase
        .from('nutrixo_meals')
        .insert([{
            user_email: userEmail,
            meal_type: mealType,
            input_method: 'photo',
            description: analysis.description || 'Refeição analisada por foto',
            image_url: fileUrl,
            image_key: uploadData.path,
            analysis,
            calories: analysis.totalCalories || 0,
            protein: analysis.totalProtein || 0,
            carbs: analysis.totalCarbs || 0,
            fats: analysis.totalFats || 0,
        }])
        .select()
        .single());

    return { id: meal?.id, analysis };
}

// ============================================================
// 🎤 FOOD - Analyze voice/text description
// ============================================================
export async function analyzeFoodDescription(text, mealType, options = {}) {
    const userEmail = await getAuthenticatedEmail();
    const { inputMethod = 'voice' } = options;

    const analysis = await generateFoodAnalysisFromText(text, mealType);

    // Save meal to DB
    const { data: meal } = await dbOperation(() => supabase
        .from('nutrixo_meals')
        .insert([{
            user_email: userEmail,
            meal_type: mealType,
            input_method: inputMethod,
            description: text,
            analysis,
            calories: analysis.totalCalories || 0,
            protein: analysis.totalProtein || 0,
            carbs: analysis.totalCarbs || 0,
            fats: analysis.totalFats || 0,
        }])
        .select()
        .single());

    return { id: meal?.id, analysis };
}

export async function getMealsByDateRange(startDate, endDate) {
    const userEmail = await getAuthenticatedEmail();
    const dateStart = `${startDate}T00:00:00`;
    const dateEnd = `${endDate}T23:59:59`;

    const { data, error } = await supabase
        .from('nutrixo_meals')
        .select('*')
        .eq('user_email', userEmail)
        .gte('created_at', dateStart)
        .lte('created_at', dateEnd)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message || 'Erro ao carregar histórico de refeições.');
    return data || [];
}

export async function updateMealEntry(mealId, payload) {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await supabase
        .from('nutrixo_meals')
        .update(payload)
        .eq('id', mealId)
        .eq('user_email', userEmail)
        .select()
        .single();

    if (error) throw new Error(error.message || 'Erro ao atualizar refeição.');
    return data;
}

export async function deleteMealEntry(mealId) {
    const userEmail = await getAuthenticatedEmail();
    const { error } = await supabase
        .from('nutrixo_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_email', userEmail);

    if (error) throw new Error(error.message || 'Erro ao excluir refeição.');
    return true;
}

export async function duplicateMealEntry(meal) {
    const userEmail = await getAuthenticatedEmail();
    const payload = {
        user_email: userEmail,
        meal_type: meal.meal_type,
        input_method: meal.input_method || 'manual',
        description: meal.description || meal.analysis?.description || 'Refeição duplicada',
        analysis: meal.analysis || null,
        calories: meal.calories || meal.analysis?.totalCalories || 0,
        protein: meal.protein || meal.analysis?.totalProtein || 0,
        carbs: meal.carbs || meal.analysis?.totalCarbs || 0,
        fats: meal.fats || meal.analysis?.totalFats || 0,
        image_url: meal.image_url || null,
        image_key: meal.image_key || null,
    };

    const { data, error } = await supabase
        .from('nutrixo_meals')
        .insert([payload])
        .select()
        .single();

    if (error) throw new Error(error.message || 'Erro ao duplicar refeição.');
    return data;
}

export async function reanalyzeMealEntry(mealId, { description, mealType }) {
    const analysis = await generateFoodAnalysisFromText(description, mealType);
    return updateMealEntry(mealId, {
        meal_type: mealType,
        description,
        analysis,
        calories: analysis.totalCalories || 0,
        protein: analysis.totalProtein || 0,
        carbs: analysis.totalCarbs || 0,
        fats: analysis.totalFats || 0,
        input_method: 'manual',
    });
}

// ============================================================
// 🤖 CHATBOT - AI-powered health assistant
// ============================================================
export async function chatWithAssistant(messages, userContext = {}) {
    let userEmail = null;
    try {
        // Tentamos pegar o email da sessão para plugar no log
        userEmail = await getAuthenticatedEmail();
    } catch {
        // Ignora erro se não estiver logado, o chat apenas será logado como unknow
    }

    const systemMessage = {
        role: 'system',
        content: `Você é o Nutrixo, um assistente de saúde e nutrição amigável e profissional. Você ajuda com:
- Dúvidas sobre nutrição e alimentação
- Interpretação de exames (de forma educacional)
- Dicas de saúde e bem-estar
- Sugestões de refeições

Contexto do usuário:
${userContext.lastExam ? `Último exame: ${JSON.stringify(userContext.lastExam)}` : 'Sem exames recentes.'}
${userContext.todayMeals ? `Refeições hoje: ${JSON.stringify(userContext.todayMeals)}` : 'Sem refeições registradas hoje.'}
${userContext.measurements ? `Medidas: ${JSON.stringify(userContext.measurements)}` : ''}

Responda sempre em português do Brasil. Seja conciso mas informativo. Use emojis para tornar a conversa mais amigável.
IMPORTANTE: Sempre lembre que você não substitui um profissional de saúde.`
    };

    // Para streaming, retorna a response do fetch
    try {
        const response = await createChatCompletion({
            model: AI_MODEL,
            messages: [systemMessage, ...messages],
            stream: true,
            originFunction: 'chatWithAssistant',
            userEmail
        });
        return streamChatCompletion(response);
    } catch (error) {
        console.warn(`[chat] Falha no modelo principal (${AI_MODEL}), aplicando fallback:`, error?.message || error);
        const fallbackResponse = await createChatCompletion({
            model: AI_FALLBACK_MODEL,
            messages: [systemMessage, ...messages],
            stream: true,
            originFunction: 'chatWithAssistant (Fallback)',
            userEmail
        });
        return streamChatCompletion(fallbackResponse);
    }
}

// ============================================================
// 📊 DATA FETCHERS - Get historical data (com validação JWT)
// ============================================================
export async function getExamHistory() {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await supabase
        .from('nutrixo_exams')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getTodayMeals() {
    const userEmail = await getAuthenticatedEmail();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('nutrixo_meals')
        .select('*')
        .eq('user_email', userEmail)
        .gte('created_at', today + 'T00:00:00')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getLatestMeasurements() {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await supabase
        .from('nutrixo_measurements')
        .select('*')
        .eq('status', 'completed')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getMeasurementHistory() {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await supabase
        .from('nutrixo_measurements')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getNutritionPlanHistory() {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await supabase
        .from('nutrixo_plans')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getLatestNutritionPlan() {
    try {
        const userEmail = await getAuthenticatedEmail();
        const { data, error } = await supabase
            .from('nutrixo_plans')
            .select('*')
            .eq('status', 'completed')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116' || error.status === 406) return null;
            throw error;
        }
        return data;
    } catch {
        console.warn("Nenhum plano alimentar encontrado para este usuário.");
        return null;
    }
}

function formatInsightId(prefix, value) {
    return `${prefix}:${String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
}

function buildInsightFacts({ latestExam, measurement, plan, todayMeals }) {
    const facts = [];
    const biomarkers = Array.isArray(latestExam?.analysis?.biomarkers) ? latestExam.analysis.biomarkers : [];

    biomarkers.forEach((b) => {
        const status = String(b?.status || '').toLowerCase();
        if (!['high', 'low', 'normal'].includes(status)) return;
        const id = formatInsightId('exam', b?.name);
        const statusPt = status === 'normal' ? 'NORMAL' : status === 'high' ? 'ALTO' : 'BAIXO';
        facts.push({
            id,
            domain: 'exam',
            severity: status === 'normal' ? 'info' : 'alert',
            status,
            text: `[STATUS ${statusPt}] ${b?.name}: ${b?.value} ${b?.unit || ''} (referência: ${b?.reference || 'não informada'})`,
        });
    });

    const measurementData = measurement?.analysis?.measurements || measurement?.analysis || {};
    const bmi = measurement?.analysis?.bmi;
    if (bmi?.value !== undefined && bmi?.value !== null) {
        let valStr = String(bmi.value).replace(',', '.');
        const val = parseFloat(valStr.match(/[\d.]+/)?.[0] || '0');
        const isAlert = val > 0 && (val < 18.5 || val >= 25);
        facts.push({
            id: 'measurement:bmi',
            domain: 'measurement',
            severity: isAlert ? 'alert' : 'info',
            status: isAlert ? (val >= 25 ? 'high' : 'low') : 'info',
            text: `IMC atual: ${bmi.value}${bmi.classification ? ` (${bmi.classification})` : ''}`,
        });
    }
    if (measurementData?.bodyFat?.value !== undefined) {
        facts.push({
            id: 'measurement:body-fat',
            domain: 'measurement',
            severity: 'info',
            status: 'info',
            text: `Gordura corporal: ${measurementData.bodyFat.value}${measurementData.bodyFat.unit ? ` ${measurementData.bodyFat.unit}` : ''}`,
        });
    }
    if (measurementData?.weight?.value !== undefined) {
        facts.push({
            id: 'measurement:weight',
            domain: 'measurement',
            severity: 'info',
            status: 'info',
            text: `Peso atual: ${measurementData.weight.value}${measurementData.weight.unit ? ` ${measurementData.weight.unit}` : ''}`,
        });
    }

    const dailyMacros = plan?.analysis?.dailyMacros || null;

    const totals = Array.isArray(todayMeals) && todayMeals.length > 0
        ? todayMeals.reduce((acc, meal) => {
            acc.calories += Number(meal?.calories || 0);
            acc.protein += Number(meal?.protein || 0);
            acc.carbs += Number(meal?.carbs || 0);
            acc.fats += Number(meal?.fats || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 })
        : { calories: 0, protein: 0, carbs: 0, fats: 0 };

    // Fatos objetivos de aderência ao plano (evitam insight incoerente quando há excesso).
    if (dailyMacros && Object.keys(dailyMacros).length > 0) {
        const comparisons = [
            { key: 'calories', label: 'calorias', unit: 'kcal' },
            { key: 'protein', label: 'proteína', unit: 'g' },
            { key: 'carbs', label: 'carboidratos', unit: 'g' },
            { key: 'fats', label: 'gorduras', unit: 'g' },
        ];

        let overLabels = [];
        let underLabels = [];
        let missingConsumption = 0;

        comparisons.forEach(({ key, label, unit }) => {
            const goal = Number(dailyMacros[key] || 0);
            if (goal <= 0) return;
            const consumed = Number(totals[key] || 0);
            if (consumed === 0) missingConsumption++;

            const delta = consumed - goal;

            if (delta > 0) {
                overLabels.push(`${label} (+${Math.round(delta)}${unit} além da meta)`);
            } else {
                underLabels.push(`${label} dentro da meta`);
            }
        });

        // Só gera métricas se realmente houver algum consumo
        if (missingConsumption < comparisons.length) {
            if (overLabels.length > 0) {
                facts.push({
                    id: `nutrition:macros-balance`,
                    domain: 'meals',
                    severity: 'alert',
                    status: 'high',
                    text: `Alerta nutricional - Consumo excedeu as metas do plano em: ${overLabels.join(', ')}.`,
                });
            } else if (underLabels.length > 0) {
                facts.push({
                    id: `nutrition:macros-balance`,
                    domain: 'meals',
                    severity: 'info',
                    status: 'info',
                    text: `Manutenção de hábitos: Todos os nutrientes acompanhados estão dentro da meta estipulada pelo plano.`,
                });
            }
        }
    } else if (totals.calories > 0) {
        // Se não tem plano mas consumiu algo, envia um fato de consumo genérico
        facts.push({
            id: 'meals:today-totals',
            domain: 'meals',
            severity: 'info',
            status: 'info',
            text: `Registro de dieta hoje: consumiu ${Math.round(totals.calories)} kcal.`,
        });
    }

    return facts;
}

function getInsightDomainBucket(domain = '') {
    if (domain === 'exam') return 'exam';
    if (domain === 'measurement') return 'measurement';
    if (domain === 'plan' || domain === 'meals') return 'nutrition';
    return 'other';
}

function getRequiredInsightBuckets(facts = []) {
    const buckets = new Set(
        facts.map((fact) => getInsightDomainBucket(fact?.domain))
            .filter((bucket) => ['exam', 'measurement', 'nutrition'].includes(bucket))
    );
    return ['nutrition', 'measurement', 'exam'].filter((bucket) => buckets.has(bucket));
}

function balanceInsightsByDomain(insights = [], facts = [], max = 3) {
    if (!Array.isArray(insights) || insights.length === 0) return [];

    const selected = [];
    const selectedFactIds = new Set();
    const requiredBuckets = getRequiredInsightBuckets(facts);

    // Primeiro garante cobertura de domínio (nutrição, medidas, exames), se houver dados.
    requiredBuckets.forEach((bucket) => {
        if (selected.length >= max) return;
        const match = insights.find((insight) => {
            if (selectedFactIds.has(insight.factId)) return false;
            return getInsightDomainBucket(insight.domain) === bucket;
        });
        if (match) {
            selected.push(match);
            selectedFactIds.add(match.factId);
        }
    });

    // Depois completa por prioridade (warning > tip > positive) e ordem original.
    const priority = { warning: 1, tip: 2, positive: 3 };
    const orderedRemaining = insights
        .filter((insight) => !selectedFactIds.has(insight.factId))
        .sort((a, b) => (priority[a.type] || 9) - (priority[b.type] || 9));

    for (const insight of orderedRemaining) {
        if (selected.length >= max) break;
        selected.push(insight);
    }

    return selected.slice(0, max);
}

function buildInsightsFallbackFromFacts(facts = []) {
    const requiredBuckets = getRequiredInsightBuckets(facts);
    const selectedFacts = [];
    const selectedFactIds = new Set();

    // Cobertura por domínio no fallback também.
    requiredBuckets.forEach((bucket) => {
        const match = facts.find((fact) => {
            if (selectedFactIds.has(fact.id)) return false;
            return getInsightDomainBucket(fact.domain) === bucket;
        });
        if (match) {
            selectedFacts.push(match);
            selectedFactIds.add(match.id);
        }
    });

    // Completa por prioridade.
    const ordered = [...facts]
        .filter((fact) => !selectedFactIds.has(fact.id))
        .sort((a, b) => {
            const aPrio = a.severity === 'alert' ? 1 : 2;
            const bPrio = b.severity === 'alert' ? 1 : 2;
            return aPrio - bPrio;
        });

    for (const fact of ordered) {
        if (selectedFacts.length >= 3) break;
        selectedFacts.push(fact);
    }

    return selectedFacts.slice(0, 3).map((fact, idx) => ({
        id: `fallback-${idx + 1}`,
        type: fact.severity === 'alert' ? 'warning' : 'tip',
        title: fact.severity === 'alert' ? 'Alerta baseado nos seus dados' : 'Resumo do seu dado atual',
        description: fact.text.slice(0, 150),
        factId: fact.id,
    }));
}

function buildInsightFromFact(fact, idPrefix = 'fallback-critical') {
    let alertTitle = 'Alerta no seu indicador';
    const domain = (fact.domain || '').toLowerCase();
    if (domain.includes('nutrition') || domain.includes('diet')) {
        alertTitle = 'Atenção ao seu consumo atual';
    } else if (domain.includes('clinic') || domain.includes('biomarker') || domain.includes('blood')) {
        alertTitle = 'Atenção ao marcador clínico';
    } else if (domain.includes('anthropometric') || domain.includes('body')) {
        alertTitle = 'Atenção à sua medida física';
    }

    return {
        id: `${idPrefix}:${fact.id}`,
        type: fact.severity === 'alert' ? 'warning' : 'tip',
        title: fact.severity === 'alert' ? alertTitle : 'Resumo do seu dado atual',
        description: String(fact.text || '').slice(0, 150),
        factId: fact.id,
        domain: fact.domain || 'other',
        severity: fact.severity || 'info',
    };
}

function enforceCriticalInsightCoverage(insights = [], facts = [], max = 3) {
    if (!Array.isArray(insights) || insights.length === 0) return insights;

    const selected = [...insights];
    const selectedFactIds = new Set(selected.map((item) => item.factId));
    const priority = { warning: 1, tip: 2, positive: 3 };
    const alertFacts = facts.filter((fact) => fact?.severity === 'alert');
    const nutritionAlertFacts = alertFacts.filter((fact) => getInsightDomainBucket(fact?.domain) === 'nutrition');

    const replaceWorstIfNeeded = (insightToInsert) => {
        if (selected.length < max) {
            selected.push(insightToInsert);
            selectedFactIds.add(insightToInsert.factId);
            return;
        }
        // substitui o insight menos prioritário (positive > tip > warning),
        // evitando remover um alerta já presente.
        let replaceIdx = -1;
        let worstScore = -1;
        selected.forEach((item, idx) => {
            const score = priority[item.type] || 9;
            const isAlert = item.type === 'warning';
            const effectiveScore = isAlert ? -1 : score;
            if (effectiveScore > worstScore) {
                worstScore = effectiveScore;
                replaceIdx = idx;
            }
        });
        if (replaceIdx >= 0) {
            selected[replaceIdx] = insightToInsert;
            selectedFactIds.add(insightToInsert.factId);
        }
    };

    // Regra 1: se existe alerta nutricional, garantir pelo menos 1 insight desse alerta.
    if (nutritionAlertFacts.length > 0) {
        const hasNutritionAlertInsight = selected.some((item) => {
            const bucket = getInsightDomainBucket(item?.domain);
            return item?.type === 'warning' && bucket === 'nutrition';
        });
        if (!hasNutritionAlertInsight) {
            const fact = nutritionAlertFacts[0];
            replaceWorstIfNeeded(buildInsightFromFact(fact, 'critical-nutrition'));
        }
    }

    // Regra 2: se existe qualquer alerta, garantir pelo menos 1 warning.
    const hasWarning = selected.some((item) => item?.type === 'warning');
    if (!hasWarning && alertFacts.length > 0) {
        const fact = alertFacts[0];
        if (!selectedFactIds.has(fact.id)) {
            replaceWorstIfNeeded(buildInsightFromFact(fact, 'critical-alert'));
        }
    }

    return selected.slice(0, max);
}

function enforcePositiveCoverageWhenHealthy(insights = [], facts = [], max = 3) {
    if (!Array.isArray(insights) || insights.length === 0) return insights;

    const hasAlertFacts = facts.some((fact) => fact?.severity === 'alert');
    if (hasAlertFacts) return insights;

    const hasPositive = insights.some((insight) => insight?.type === 'positive');
    if (hasPositive) return insights;

    const selected = [...insights];
    const candidateFacts = facts.filter((fact) => fact?.severity !== 'alert');
    if (candidateFacts.length === 0) return insights;

    const preferred =
        candidateFacts.find((fact) => getInsightDomainBucket(fact.domain) === 'nutrition') ||
        candidateFacts.find((fact) => getInsightDomainBucket(fact.domain) === 'exam') ||
        candidateFacts[0];

    const positiveInsight = {
        id: `healthy-positive:${preferred.id}`,
        type: 'positive',
        title: 'Bom trabalho no seu acompanhamento',
        description: String(preferred.text || '').slice(0, 150),
        factId: preferred.id,
        domain: preferred.domain || 'other',
        severity: preferred.severity || 'info',
    };

    if (selected.length < max) {
        selected.push(positiveInsight);
        return selected.slice(0, max);
    }

    // Substitui um tip para garantir ao menos um positivo.
    const tipIdx = selected.findIndex((item) => item?.type === 'tip');
    if (tipIdx >= 0) {
        selected[tipIdx] = positiveInsight;
        return selected.slice(0, max);
    }

    // Se não houver tip, substitui o último.
    selected[selected.length - 1] = positiveInsight;
    return selected.slice(0, max);
}

function normalizeInsightByFact(insight, fact) {
    if (!fact) return insight;

    const next = { ...insight };
    const text = `${next.title} ${next.description}`.toLowerCase();
    const saysNormal = text.includes('normal') || text.includes('dentro da faixa') || text.includes('equilibrad');

    if (fact.severity === 'alert') {
        next.type = 'warning';
        if (saysNormal) {
            let alertTitle = 'Alerta no seu indicador';
            const domain = (fact.domain || '').toLowerCase();
            if (domain.includes('nutrition') || domain.includes('diet')) {
                alertTitle = 'Atenção ao seu consumo atual';
            } else if (domain.includes('clinic') || domain.includes('biomarker') || domain.includes('blood')) {
                alertTitle = 'Atenção ao marcador clínico';
            } else if (domain.includes('anthropometric') || domain.includes('body')) {
                alertTitle = 'Atenção à sua medida física';
            }

            next.title = alertTitle;
            next.description = fact.text.slice(0, 150);
        }
    }

    if (fact.severity !== 'alert' && next.type === 'warning') {
        next.type = 'tip';
    }

    return next;
}

export async function generateHealthInsights({ context = 'dashboard' } = {}) {
    let factsCache = [];
    try {
        await getAuthenticatedEmail();

        // 1. Coletar dados mais recentes para contexto
        const [history, measurement, plan, todayMeals] = await Promise.all([
            getExamHistory(),
            getLatestMeasurements(),
            getLatestNutritionPlan(),
            getTodayMeals(),
        ]);

        const latestExam = history && history.length > 0 ? history[0] : null;

        // Se não houver dados, não faz sentido chamar a IA
        if (!latestExam && !measurement && !plan) {
            return [];
        }

        // 2. Preparar fatos reais e validados para IA (evita alucinação)
        const facts = buildInsightFacts({ latestExam, measurement, plan, todayMeals });
        factsCache = facts;
        if (facts.length === 0) return [];

        // 3. Selecionar o prompt adequado segundo o contexto
        let promptReview = '';
        if (context === 'progress') {
            promptReview = `Você é um Especialista em Tendência e Evolução de Saúde. Sua análise deve focar na progressão temporal e no impacto das mudanças. Identifique se o usuário está melhorando, mantendo estabilidade ou necessitando de atenção corretiva.
Mantenha um tom encorajador, porém técnico.
Gere insights SOMENTE com base nos fatos fornecidos na entrada.
JSON estruturado:
{
  "insights": [
    {
      "id": "string única",
      "type": "positive" | "warning" | "tip",
      "title": "Título focado em evolução ou tendência (curto)",
      "description": "Análise prática e construtiva apontando próximos passos lógicos. Máx 150 chars.",
      "factId": "id de um fato de entrada usado no insight"
    }
  ]
}
Regras OBRIGATÓRIAS (Punição severa se descumpridas):
- Use EXATAMENTE 3 insights.
- Priorize cobertura dos domínios disponíveis: alimentação, medidas e exames. NUNCA gere 2 ou 3 insights para o mesmo tema/domínio (ex: não gere 3 insights só de dieta).
- Todo insight DEVE referenciar um factId válido da entrada.
- NUNCA declare que um valor está "alto", "elevado" ou "em risco" se o fato indicar [STATUS NORMAL].
- ABSOLUTAMENTE PROIBIDO inventar métricas, exames (ex: triglicerídeos) ou diagnósticos que não estejam EXPLICITAMENTE nos fatos fornecidos.
- Se os dados estiverem saudáveis/normais, crie recomendações de manutenção (tip) ou parabenize (positive), mas JAMAIS invente um problema (warning).
Retorne APENAS o JSON.`;
        } else {
            promptReview = `Você é uma Sentinela Analítica de Saúde, focada em alertar sobre o estado do momento e identificar desalinhamentos críticos imediatos.
Sua análise deve ser direta, tática e alertar rapidamente para situações de risco (se houverem) ou reforçar o status atual de forma objetiva.
Gere insights SOMENTE com base nos fatos fornecidos na entrada.
JSON estruturado:
{
  "insights": [
    {
      "id": "string única",
      "type": "positive" | "warning" | "tip",
      "title": "Título com foco no estado macro ou alerta (curto)",
      "description": "Explicação direta do risco ou validação do momento atual. Máx 150 chars.",
      "factId": "id de um fato de entrada usado no insight"
    }
  ]
}
Regras OBRIGATÓRIAS (Punição severa se descumpridas):
- Use EXATAMENTE 3 insights.
- Priorize cobertura dos domínios disponíveis: alimentação, medidas e exames. NUNCA gere 2 ou 3 insights repetitivos (ex: apenas alertas alimentares).
- Todo insight DEVE referenciar um factId válido da entrada.
- NUNCA declare que um valor está "alto", "elevado", "ruim" ou apresenta "risco" se o fato indicar [STATUS NORMAL].
- ABSOLUTAMENTE PROIBIDO inventar métricas, exames ou problemas que não estejam EXPLICITAMENTE nos fatos fornecidos.
- Se os dados estiverem saudáveis/normais, os insights devem ser de validação e manutenção (positive/tip).
Retorne APENAS o JSON.`;
        }

        const userEmail = await getAuthenticatedEmail();

        const completion = await createChatCompletion({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: promptReview
                },
                {
                    role: 'user',
                    content: `Fatos reais do usuário: ${JSON.stringify(facts)}`
                }
            ],
            originFunction: 'generateHealthInsights',
            userEmail
        });

        const parsed = parseAIJsonResponse(completion.choices[0].message.content);
        const factsById = new Map(facts.map((fact) => [fact.id, fact]));
        const factIds = new Set(facts.map((f) => f.id));
        const insights = Array.isArray(parsed?.insights) ? parsed.insights : [];

        const validated = insights
            .filter((insight) => insight && typeof insight === 'object')
            .filter((insight) => factIds.has(String(insight.factId || '')))
            .map((insight, idx) => {
                const factId = String(insight.factId);
                const fact = factsById.get(factId);
                const normalized = normalizeInsightByFact({
                    id: insight.id || `insight-${idx + 1}`,
                    type: ['positive', 'warning', 'tip'].includes(insight.type) ? insight.type : 'tip',
                    title: String(insight.title || 'Insight').slice(0, 80),
                    description: String(insight.description || '').slice(0, 150),
                    factId,
                    domain: fact?.domain || 'other',
                    severity: fact?.severity || 'info',
                }, fact);
                return normalized;
            });

        const balanced = balanceInsightsByDomain(validated, facts, 3);
        const withCriticalCoverage = enforceCriticalInsightCoverage(balanced, facts, 3);
        const withHealthyPositive = enforcePositiveCoverageWhenHealthy(withCriticalCoverage, facts, 3);

        if (withHealthyPositive.length === 0) {
            return buildInsightsFallbackFromFacts(facts);
        }

        if (withHealthyPositive.length < 3) {
            const fallback = buildInsightsFallbackFromFacts(facts)
                .filter((item) => !withHealthyPositive.some((v) => v.factId === item.factId));
            return enforcePositiveCoverageWhenHealthy([...withHealthyPositive, ...fallback].slice(0, 3), facts, 3);
        }

        return withHealthyPositive;

    } catch (error) {
        console.error("Erro ao gerar insights por IA:", error);
        return factsCache.length > 0 ? buildInsightsFallbackFromFacts(factsCache) : [];
    }
}

// ============================================================
// HELPERS
// ============================================================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}
