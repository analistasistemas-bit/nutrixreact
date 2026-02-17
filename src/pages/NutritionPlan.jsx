import React, { useState } from 'react';
import { ClipboardList, UtensilsCrossed, CheckCircle } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeNutritionPlan } from '../services/aiService';
import AIAnalysisPage from '../components/common/AIAnalysisPage';

const NutritionPlan = () => {
    const { trackAction, addXP } = useGamification();

    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadedFile(file.name);
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeNutritionPlan(file);
            setAnalysisResult(result.analysis);
            addXP('UPLOAD_PLAN');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar o plano. Tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        setError(null);
    };

    return (
        <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
            <AIAnalysisPage.Header
                icon={ClipboardList}
                title="Plano Alimentar Inteligente"
                description="Faça upload do seu plano alimentar e receba análise + sugestões por IA 🤖"
                gradient="from-green-500 to-emerald-500"
            />

            <AIAnalysisPage.UploadZone
                onUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                accept=".pdf,.docx"
                label="Selecionar Plano Alimentar"
            />

            <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message="IA Analisando Plano..." gradient="bg-emerald-500" />
            <AIAnalysisPage.Error error={error} onReset={resetUpload} />

            <AIAnalysisPage.Results show={!!analysisResult}>
                {/* Success */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-bold text-green-800 dark:text-green-400 text-sm">Plano Analisado! +40 XP</span>
                    </div>
                    <button onClick={resetUpload} className="text-green-700 dark:text-green-400 text-xs font-medium underline hover:text-green-900 dark:hover:text-green-300">
                        Enviar novo plano
                    </button>
                </div>

                {/* Daily Macros */}
                {analysisResult?.dailyMacros && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-border-subtle rounded-xl p-5 shadow-sm">
                        <h3 className="font-bold text-green-800 dark:text-green-400 mb-3 text-lg">🔥 Macros Diários do Plano</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                <p className="text-xs text-gray-500 dark:text-text-muted">Calorias</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">{analysisResult.dailyMacros.calories}</p>
                                <p className="text-xs text-gray-400">kcal</p>
                            </div>
                            <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                <p className="text-xs text-gray-500 dark:text-text-muted">🥩 Proteínas</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analysisResult.dailyMacros.protein}g</p>
                            </div>
                            <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                <p className="text-xs text-gray-500 dark:text-text-muted">🍞 Carboidratos</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analysisResult.dailyMacros.carbs}g</p>
                            </div>
                            <div className="bg-white dark:bg-bg-secondary rounded-xl p-3 text-center border border-gray-100 dark:border-border-subtle">
                                <p className="text-xs text-gray-500 dark:text-text-muted">🥑 Gorduras</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisResult.dailyMacros.fats}g</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meals */}
                {analysisResult?.meals?.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg text-green-700 dark:text-green-400">🍽️ Refeições do Plano</h3>
                        {analysisResult.meals.map((meal, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <UtensilsCrossed className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <h4 className="font-bold text-gray-900 dark:text-text-primary">{meal.time} — {meal.name}</h4>
                                    </div>
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{meal.calories} kcal</span>
                                </div>
                                {meal.ingredients && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {meal.ingredients.map((ing, i) => (
                                            <span key={i} className="bg-white dark:bg-bg-tertiary border border-gray-200 dark:border-border-subtle text-gray-600 dark:text-text-secondary text-xs px-2 py-1 rounded-lg">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex space-x-4 mt-2 text-xs text-gray-500 dark:text-text-muted">
                                    <span>P: {meal.protein}g</span>
                                    <span>C: {meal.carbs}g</span>
                                    <span>G: {meal.fats}g</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {analysisResult?.summary && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-border-subtle rounded-xl p-4">
                        <h3 className="font-bold text-green-800 dark:text-green-400 text-sm mb-1">📝 Resumo do Plano</h3>
                        <p className="text-green-700 dark:text-text-secondary text-sm">{analysisResult.summary}</p>
                    </div>
                )}

                {/* Suggestions */}
                {analysisResult?.suggestions?.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-border-subtle rounded-xl p-4">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm mb-2">💡 Sugestões da IA</h3>
                        <ul className="space-y-1">
                            {analysisResult.suggestions.map((sug, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm text-emerald-700 dark:text-text-secondary">
                                    <span className="text-emerald-400 mt-1">•</span>
                                    <span>{sug}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </AIAnalysisPage.Results>

            <AIAnalysisPage.Disclaimer />
        </AIAnalysisPage>
    );
};

export default NutritionPlan;
