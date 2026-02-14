/**
 * Nutrixo AI Service Layer
 * Connects frontend to InsForge AI, Storage, and Database
 */
import insforge from '../lib/insforge';

const AI_MODEL = 'openai/gpt-4o-mini';

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
export async function analyzeExam(file) {
    validateFile(file);
    // 1. Upload PDF to storage
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    // 2. Create pending record in DB
    const { data: examRecord, error: dbError } = await insforge.database
        .from('nutrixo_exams')
        .insert([{
            file_name: file.name,
            file_url: uploadData.url,
            file_key: uploadData.key,
            status: 'analyzing',
        }])
        .select()
        .single();

    if (dbError) throw new Error('Erro ao salvar registro: ' + dbError.message);

    // 3. Analyze with AI (PDF parser)
    const completion = await insforge.ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um assistente de saúde que analisa exames de sangue. Analise o PDF do exame e retorne um JSON válido com esta estrutura exata:
{
  "biomarkers": [
    {
      "name": "Nome do biomarcador",
      "value": 123,
      "unit": "mg/dL",
      "reference": "100-200",
      "status": "normal" | "low" | "high"
    }
  ],
  "summary": "Resumo geral dos resultados em português",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "alerts": ["Alerta sobre valores críticos, se houver"]
}
Retorne APENAS o JSON, sem markdown, sem texto adicional.`
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analise este exame de sangue e retorne os resultados em JSON:' },
                    {
                        type: 'file',
                        file: {
                            filename: file.name,
                            file_data: uploadData.url,
                        },
                    },
                ],
            },
        ],
        fileParser: { enabled: true },
    });

    const responseText = completion.choices[0].message.content;
    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : { raw: responseText };
    }

    // 4. Update DB with results
    await insforge.database
        .from('nutrixo_exams')
        .update({ analysis, status: 'completed' })
        .eq('id', examRecord.id);

    return { id: examRecord.id, analysis };
}

// ============================================================
// 📏 MEASUREMENTS - Analyze body measurement PDFs
// ============================================================
export async function analyzeMeasurements(file) {
    validateFile(file);
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    const { data: record, error: dbError } = await insforge.database
        .from('nutrixo_measurements')
        .insert([{
            file_name: file.name,
            file_url: uploadData.url,
            file_key: uploadData.key,
            status: 'analyzing',
        }])
        .select()
        .single();

    if (dbError) throw new Error('Erro ao salvar registro: ' + dbError.message);

    const completion = await insforge.ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um nutricionista que analisa medidas corporais. Analise o PDF e retorne um JSON válido:
{
  "measurements": {
    "weight": { "value": 75, "unit": "kg" },
    "height": { "value": 170, "unit": "cm" },
    "waist": { "value": 80, "unit": "cm" },
    "hip": { "value": 95, "unit": "cm" },
    "chest": { "value": 100, "unit": "cm" },
    "arm": { "value": 32, "unit": "cm" },
    "thigh": { "value": 55, "unit": "cm" },
    "bodyFat": { "value": 18, "unit": "%" }
  },
  "bmi": { "value": 25.9, "classification": "Sobrepeso" },
  "waistHipRatio": { "value": 0.84, "classification": "Normal" },
  "summary": "Resumo da análise corporal",
  "recommendations": ["Recomendação 1", "Recomendação 2"]
}
Inclua apenas as medidas que conseguir extrair do documento. Retorne APENAS o JSON.`
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analise estas medidas corporais e retorne os resultados em JSON:' },
                    {
                        type: 'file',
                        file: { filename: file.name, file_data: uploadData.url },
                    },
                ],
            },
        ],
        fileParser: { enabled: true },
    });

    const responseText = completion.choices[0].message.content;
    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : { raw: responseText };
    }

    await insforge.database
        .from('nutrixo_measurements')
        .update({ analysis, status: 'completed' })
        .eq('id', record.id);

    return { id: record.id, analysis };
}

// ============================================================
// 📋 NUTRITION PLAN - Analyze and generate recipes
// ============================================================
export async function analyzeNutritionPlan(file) {
    validateFile(file);
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    const { data: record, error: dbError } = await insforge.database
        .from('nutrixo_plans')
        .insert([{
            file_name: file.name,
            file_url: uploadData.url,
            file_key: uploadData.key,
            status: 'analyzing',
        }])
        .select()
        .single();

    if (dbError) throw new Error('Erro ao salvar registro: ' + dbError.message);

    const completion = await insforge.ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
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
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analise este plano alimentar e extraia as refeições e macros:' },
                    {
                        type: 'file',
                        file: { filename: file.name, file_data: uploadData.url },
                    },
                ],
            },
        ],
        fileParser: { enabled: true },
    });

    const responseText = completion.choices[0].message.content;
    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : { raw: responseText };
    }

    await insforge.database
        .from('nutrixo_plans')
        .update({ analysis, status: 'completed' })
        .eq('id', record.id);

    return { id: record.id, analysis };
}

// ============================================================
// 📸 FOOD - Analyze food photo with AI Vision
// ============================================================
export async function analyzeFoodPhoto(file, mealType) {
    validateFile(file);
    // Convert file to base64 for vision
    const base64 = await fileToBase64(file);

    // Upload photo to storage
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar foto: ' + uploadError.message);

    const completion = await insforge.ai.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: 'system',
                content: `Você é um nutricionista que analisa fotos de refeições. Identifique os alimentos na foto e estime os valores nutricionais. Retorne JSON:
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
}
Retorne APENAS o JSON.`
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: `Esta é uma foto do meu ${mealType}. Identifique os alimentos e estime as calorias:` },
                    {
                        type: 'image_url',
                        image_url: { url: base64 },
                    },
                ],
            },
        ],
    });

    const responseText = completion.choices[0].message.content;
    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : { raw: responseText };
    }

    // Save meal to DB
    const { data: meal } = await insforge.database
        .from('nutrixo_meals')
        .insert([{
            meal_type: mealType,
            input_method: 'photo',
            description: analysis.description || 'Refeição analisada por foto',
            image_url: uploadData.url,
            image_key: uploadData.key,
            analysis,
            calories: analysis.totalCalories || 0,
            protein: analysis.totalProtein || 0,
            carbs: analysis.totalCarbs || 0,
            fats: analysis.totalFats || 0,
        }])
        .select()
        .single();

    return { id: meal?.id, analysis };
}

// ============================================================
// 🎤 FOOD - Analyze voice/text description
// ============================================================
export async function analyzeFoodDescription(text, mealType) {
    const completion = await insforge.ai.chat.completions.create({
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
    let analysis;
    try {
        analysis = JSON.parse(responseText);
    } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : { raw: responseText };
    }

    // Save meal to DB
    const { data: meal } = await insforge.database
        .from('nutrixo_meals')
        .insert([{
            meal_type: mealType,
            input_method: 'voice',
            description: text,
            analysis,
            calories: analysis.totalCalories || 0,
            protein: analysis.totalProtein || 0,
            carbs: analysis.totalCarbs || 0,
            fats: analysis.totalFats || 0,
        }])
        .select()
        .single();

    return { id: meal?.id, analysis };
}

// ============================================================
// 🤖 CHATBOT - AI-powered health assistant
// ============================================================
export async function chatWithAssistant(messages, userContext = {}) {
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

    const stream = await insforge.ai.chat.completions.create({
        model: AI_MODEL,
        messages: [systemMessage, ...messages],
        stream: true,
    });

    return stream;
}

// ============================================================
// 📊 DATA FETCHERS - Get historical data
// ============================================================
export async function getExamHistory() {
    const { data, error } = await insforge.database
        .from('nutrixo_exams')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getTodayMeals() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await insforge.database
        .from('nutrixo_meals')
        .select('*')
        .gte('created_at', today + 'T00:00:00')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getLatestMeasurements() {
    const { data, error } = await insforge.database
        .from('nutrixo_measurements')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
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
