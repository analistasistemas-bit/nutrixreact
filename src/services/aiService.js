/**
 * Nutrixo AI Service Layer
 * Connects frontend to InsForge AI, Storage, and Database
 * 🛡️ Todas as chamadas de dados de saúde passam por validação JWT
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

/**
 * 🛡️ Valida JWT e retorna o email do usuário autenticado.
 * Deve ser chamada no início de toda operação que leia ou escreva dados de saúde.
 */
async function getAuthenticatedEmail() {
    const { data, error } = await insforge.auth.getCurrentSession();

    if (error || !data?.session) {
        throw new Error('🔒 Sessão expirada. Faça login novamente.');
    }

    if (data.session.expiresAt && new Date() > new Date(data.session.expiresAt)) {
        throw new Error('🔒 Sessão expirada. Faça login novamente.');
    }

    const email = data.session.user?.email;
    if (!email) {
        throw new Error('🔒 Usuário sem email identificado na sessão.');
    }

    return email;
}

// ============================================================
// 🧪 EXAMS - Analyze blood test PDFs
// ============================================================
export async function analyzeExam(file) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    // 1. Upload PDF to storage
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    const fileUrl = insforge.storage
        .from('uploads')
        .getPublicUrl(uploadData.key);

    // Convert file to base64 for AI analysis (bypass storage URL issues)
    const fileBase64 = await fileToBase64(file);

    console.log('DEBUG: fileUrl (DB):', fileUrl);

    // 2. Create pending record in DB — associado ao user autenticado
    const { data: examRecord, error: dbError } = await insforge.database
        .from('nutrixo_exams')
        .insert([{
            user_email: userEmail,
            file_name: file.name,
            file_url: fileUrl,
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
                            file_data: fileBase64,
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
        .eq('id', examRecord.id)
        .eq('user_email', userEmail);

    return { id: examRecord.id, analysis };
}

// ============================================================
// 📏 MEASUREMENTS - Analyze body measurement PDFs
// ============================================================
export async function analyzeMeasurements(file) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    const fileUrl = insforge.storage
        .from('uploads')
        .getPublicUrl(uploadData.key);

    // Convert file to base64 for AI analysis
    const fileBase64 = await fileToBase64(file);

    const { data: record, error: dbError } = await insforge.database
        .from('nutrixo_measurements')
        .insert([{
            user_email: userEmail,
            file_name: file.name,
            file_url: fileUrl,
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
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analise estas medidas corporais e retorne os resultados em JSON:' },
                    {
                        type: 'file',
                        file: { filename: file.name, file_data: fileBase64 },
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
        .eq('id', record.id)
        .eq('user_email', userEmail);

    return { id: record.id, analysis };
}

// ============================================================
// 📋 NUTRITION PLAN - Analyze and generate recipes
// ============================================================
export async function analyzeNutritionPlan(file) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar arquivo: ' + uploadError.message);

    const fileUrl = insforge.storage
        .from('uploads')
        .getPublicUrl(uploadData.key);

    // Convert file to base64 for AI analysis
    const fileBase64 = await fileToBase64(file);

    const { data: record, error: dbError } = await insforge.database
        .from('nutrixo_plans')
        .insert([{
            user_email: userEmail,
            file_name: file.name,
            file_url: fileUrl,
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
                        file: { filename: file.name, file_data: fileBase64 },
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
        .eq('id', record.id)
        .eq('user_email', userEmail);

    return { id: record.id, analysis };
}

// ============================================================
// 📸 FOOD - Analyze food photo with AI Vision
// ============================================================
export async function analyzeFoodPhoto(file, mealType) {
    validateFile(file);
    const userEmail = await getAuthenticatedEmail();

    // Convert file to base64 for vision
    const base64 = await fileToBase64(file);

    // Upload photo to storage
    const { data: uploadData, error: uploadError } = await insforge.storage
        .from('uploads')
        .uploadAuto(file);

    if (uploadError) throw new Error('Erro ao enviar foto: ' + uploadError.message);

    const fileUrl = insforge.storage
        .from('uploads')
        .getPublicUrl(uploadData.key);

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

    // Save meal to DB — associado ao user autenticado
    const { data: meal } = await insforge.database
        .from('nutrixo_meals')
        .insert([{
            user_email: userEmail,
            meal_type: mealType,
            input_method: 'photo',
            description: analysis.description || 'Refeição analisada por foto',
            image_url: fileUrl,
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
    const userEmail = await getAuthenticatedEmail();

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

    // Save meal to DB — associado ao user autenticado
    const { data: meal } = await insforge.database
        .from('nutrixo_meals')
        .insert([{
            user_email: userEmail,
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
// 📊 DATA FETCHERS - Get historical data (com validação JWT)
// ============================================================
export async function getExamHistory() {
    const userEmail = await getAuthenticatedEmail();
    const { data, error } = await insforge.database
        .from('nutrixo_exams')
        .select('*')
        .eq('status', 'completed')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getTodayMeals() {
    const userEmail = await getAuthenticatedEmail();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await insforge.database
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
    const { data, error } = await insforge.database
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
    const { data, error } = await insforge.database
        .from('nutrixo_measurements')
        .select('*')
        .eq('status', 'completed')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getLatestNutritionPlan() {
    try {
        const userEmail = await getAuthenticatedEmail();
        const { data, error } = await insforge.database
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

export async function generateHealthInsights() {
    try {
        await getAuthenticatedEmail();

        // 1. Coletar dados mais recentes para contexto
        const [history, measurement, plan] = await Promise.all([
            getExamHistory(),
            getLatestMeasurements(),
            getLatestNutritionPlan()
        ]);

        const latestExam = history && history.length > 0 ? history[0] : null;

        // Se não houver dados, não faz sentido chamar a IA
        if (!latestExam && !measurement && !plan) {
            return [];
        }

        // 2. Preparar contexto para a IA
        const context = {
            exam: latestExam?.analysis || null,
            measurement: measurement?.analysis || null,
            plan: plan?.analysis || null
        };

        // 3. Chamar IA para gerar insights
        const completion = await insforge.ai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `Você é um especialista em saúde e longevidade. Analise os dados do usuário e gere exatamente 3 insights curtos e impactantes.
                    JSON estruturado:
                    {
                      "insights": [
                        {
                          "id": "string único",
                          "type": "positive" | "warning" | "tip",
                          "title": "Título curto",
                          "description": "Descrição de no máximo 150 caracteres"
                        }
                      ]
                    }
                    Priorize:
                    - Alertas se houver exames alterados.
                    - Elogios se o IMC ou gordura estiverem bons.
                    - Dicas baseadas no plano alimentar vs medidas físicas.
                    Retorne APENAS o JSON.`
                },
                {
                    role: 'user',
                    content: `Dados atuais: ${JSON.stringify(context)}. Gere os 3 melhores insights agora.`
                }
            ],
            response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return response.insights || [];

    } catch (error) {
        console.error("Erro ao gerar insights por IA:", error);
        return [];
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
