import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Upload, Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle, UtensilsCrossed } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeNutritionPlan } from '../services/aiService';
import MacroNutrientsCard from '../components/MacroNutrientsCard';

const NutritionPlan = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const { addXP } = useGamification();

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

    const macroNutrients = analysisResult?.dailyMacros ? [
        { name: 'Proteínas', current: analysisResult.dailyMacros.protein, target: analysisResult.dailyMacros.protein, color: 'from-red-500 to-rose-500', icon: '🥩' },
        { name: 'Carboidratos', current: analysisResult.dailyMacros.carbs, target: analysisResult.dailyMacros.carbs, color: 'from-amber-500 to-yellow-500', icon: '🍞' },
        { name: 'Gorduras', current: analysisResult.dailyMacros.fats, target: analysisResult.dailyMacros.fats, color: 'from-green-500 to-emerald-500', icon: '🥑' },
    ] : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        📋 Plano Alimentar Inteligente
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Faça upload do seu plano alimentar e receba análise + sugestões por IA 🤖
                    </p>
                </div>

                {/* Upload */}
                {!uploadedFile ? (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition-all duration-300 cursor-pointer"
                    >
                        <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" id="plan-upload" />
                        <label htmlFor="plan-upload" className="cursor-pointer">
                            <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                                <span className="text-sm">📄 Selecionar Plano Alimentar</span>
                                <Sparkles className="w-3 h-3" />
                            </div>
                            <p className="text-gray-500 text-xs mt-3">PDF ou DOCX • Análise por IA</p>
                        </label>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {/* Loading */}
                        {isAnalyzing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                                <Loader2 className="w-10 h-10 text-green-600 mx-auto mb-3 animate-spin" />
                                <h3 className="font-bold text-green-800 text-lg">🤖 IA Analisando Plano...</h3>
                                <p className="text-green-700 text-sm mt-1">Extraindo refeições e calculando macros ⚡</p>
                                <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                                    <motion.div className="bg-green-500 h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 10, ease: 'easeOut' }} />
                                </div>
                            </motion.div>
                        )}

                        {/* Error */}
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-red-800 text-sm">Erro na Análise</h3>
                                            <p className="text-red-700 text-xs">{error}</p>
                                        </div>
                                    </div>
                                    <button onClick={resetUpload} className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Tentar novamente</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Results */}
                        <AnimatePresence>
                            {analysisResult && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    {/* Success */}
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-bold text-green-800 text-sm">Plano Analisado! +40 XP</span>
                                        </div>
                                        <button onClick={resetUpload} className="text-green-700 text-xs font-medium underline hover:text-green-900">
                                            Enviar novo plano
                                        </button>
                                    </div>

                                    {/* Daily Macros */}
                                    {analysisResult.dailyMacros && (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                                            <h3 className="font-bold text-green-800 mb-3 text-lg">🔥 Macros Diários do Plano</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                    <p className="text-xs text-gray-500">Calorias</p>
                                                    <p className="text-2xl font-bold text-gray-900">{analysisResult.dailyMacros.calories}</p>
                                                    <p className="text-xs text-gray-400">kcal</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                    <p className="text-xs text-gray-500">🥩 Proteínas</p>
                                                    <p className="text-2xl font-bold text-red-600">{analysisResult.dailyMacros.protein}g</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                    <p className="text-xs text-gray-500">🍞 Carboidratos</p>
                                                    <p className="text-2xl font-bold text-amber-600">{analysisResult.dailyMacros.carbs}g</p>
                                                </div>
                                                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                    <p className="text-xs text-gray-500">🥑 Gorduras</p>
                                                    <p className="text-2xl font-bold text-green-600">{analysisResult.dailyMacros.fats}g</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Meals */}
                                    {analysisResult.meals?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-lg text-green-700">🍽️ Refeições do Plano</h3>
                                            {analysisResult.meals.map((meal, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <UtensilsCrossed className="w-4 h-4 text-green-600" />
                                                            <h4 className="font-bold text-gray-900">{meal.time} — {meal.name}</h4>
                                                        </div>
                                                        <span className="text-sm font-bold text-green-600">{meal.calories} kcal</span>
                                                    </div>
                                                    {meal.ingredients && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {meal.ingredients.map((ing, i) => (
                                                                <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-lg">
                                                                    {ing}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                                        <span>P: {meal.protein}g</span>
                                                        <span>C: {meal.carbs}g</span>
                                                        <span>G: {meal.fats}g</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {analysisResult.summary && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <h3 className="font-bold text-green-800 text-sm mb-1">📝 Resumo do Plano</h3>
                                            <p className="text-green-700 text-sm">{analysisResult.summary}</p>
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {analysisResult.suggestions?.length > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                            <h3 className="font-bold text-emerald-800 text-sm mb-2">💡 Sugestões da IA</h3>
                                            <ul className="space-y-1">
                                                {analysisResult.suggestions.map((sug, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2 text-sm text-emerald-700">
                                                        <span className="text-emerald-400 mt-1">•</span>
                                                        <span>{sug}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Disclaimer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-700 text-xs">
                            A análise da IA é complementar e não substitui o acompanhamento de um nutricionista. Consulte um profissional para ajustes no seu plano. 🩺
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default NutritionPlan;
