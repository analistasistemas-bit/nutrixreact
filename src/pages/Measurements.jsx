import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Upload, Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle, Scale, TrendingUp } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeMeasurements } from '../services/aiService';

const Measurements = () => {
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
            const result = await analyzeMeasurements(file);
            setAnalysisResult(result.analysis);
            addXP('UPLOAD_EXAM');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar as medidas. Tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        setError(null);
    };

    const getBMIColor = (value) => {
        if (value < 18.5) return 'text-yellow-600';
        if (value < 25) return 'text-green-600';
        if (value < 30) return 'text-orange-600';
        return 'text-red-600';
    };

    const measurements = analysisResult?.measurements || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Ruler className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        📏 Análise de Medidas Corporais
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Faça upload das suas medidas corporais e receba uma análise personalizada por IA 🧠
                    </p>
                </div>

                {/* Upload Section */}
                {!uploadedFile ? (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-all duration-300 cursor-pointer"
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="measurements-upload"
                        />
                        <label htmlFor="measurements-upload" className="cursor-pointer">
                            <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                                <span className="text-sm">📄 Selecionar Arquivo PDF</span>
                                <Sparkles className="w-3 h-3" />
                            </div>
                            <p className="text-gray-500 text-xs mt-3">Suportamos apenas arquivos PDF • Análise por IA</p>
                        </label>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {/* Loading */}
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center"
                            >
                                <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-spin" />
                                <h3 className="font-bold text-blue-800 text-lg">🤖 IA Analisando Medidas...</h3>
                                <p className="text-blue-700 text-sm mt-1">Extraindo dados corporais e calculando indicadores ⚡</p>
                                <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                                    <motion.div
                                        className="bg-blue-500 h-2 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '90%' }}
                                        transition={{ duration: 8, ease: 'easeOut' }}
                                    />
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
                                            <span className="font-bold text-green-800 text-sm">Análise Completa! +30 XP</span>
                                        </div>
                                        <button onClick={resetUpload} className="text-green-700 text-xs font-medium underline hover:text-green-900">
                                            Enviar novas medidas
                                        </button>
                                    </div>

                                    {/* BMI Card */}
                                    {analysisResult.bmi && (
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <Scale className="w-5 h-5 text-blue-600" />
                                                        <h3 className="font-bold text-blue-800">IMC</h3>
                                                    </div>
                                                    <p className={`text-3xl font-bold ${getBMIColor(analysisResult.bmi.value)}`}>
                                                        {analysisResult.bmi.value}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-700">{analysisResult.bmi.classification}</p>
                                                    {analysisResult.waistHipRatio && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Cintura/Quadril: {analysisResult.waistHipRatio.value} ({analysisResult.waistHipRatio.classification})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Measurements Grid */}
                                    <h3 className="font-bold text-lg text-blue-700">📐 Medidas Extraídas</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {Object.entries(measurements).map(([key, data], idx) => {
                                            if (!data || !data.value) return null;
                                            const labels = {
                                                weight: '⚖️ Peso', height: '📏 Altura', waist: '🔵 Cintura',
                                                hip: '🟢 Quadril', chest: '🟡 Tórax', arm: '💪 Braço',
                                                thigh: '🦵 Coxa', bodyFat: '🔥 % Gordura',
                                            };
                                            return (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.08 }}
                                                    className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center"
                                                >
                                                    <p className="text-xs text-gray-500 mb-1">{labels[key] || key}</p>
                                                    <p className="text-xl font-bold text-gray-900">{data.value}</p>
                                                    <p className="text-xs text-gray-400">{data.unit}</p>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary */}
                                    {analysisResult.summary && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <h3 className="font-bold text-blue-800 text-sm mb-1">📝 Análise</h3>
                                            <p className="text-blue-700 text-sm">{analysisResult.summary}</p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {analysisResult.recommendations?.length > 0 && (
                                        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                                            <h3 className="font-bold text-cyan-800 text-sm mb-2">💡 Recomendações</h3>
                                            <ul className="space-y-1">
                                                {analysisResult.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2 text-sm text-cyan-700">
                                                        <span className="text-cyan-400 mt-1">•</span>
                                                        <span>{rec}</span>
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
            </div>
        </motion.div>
    );
};

export default Measurements;
