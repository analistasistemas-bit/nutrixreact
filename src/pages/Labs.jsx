import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Upload, Sparkles, Target, AlertTriangle, Star, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeExam } from '../services/aiService';

const Labs = () => {
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
            const result = await analyzeExam(file);
            setAnalysisResult(result.analysis);
            addXP('UPLOAD_EXAM');
        } catch (err) {
            console.error('Erro na análise:', err);
            setError(err.message || 'Erro ao analisar o exame. Tente novamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        setError(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'low': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'high': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-green-100 text-green-700 border border-green-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'low': return '⚠️ Baixo';
            case 'high': return '⚠️ Alto';
            default: return '✅ Normal';
        }
    };

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
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🔬 Análise de Exames de Sangue
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Faça upload do seu exame e receba uma análise personalizada por IA 🧠
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
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 inline-flex items-center space-x-1.5">
                                <span className="text-sm">📄 Selecionar Arquivo PDF</span>
                                <Sparkles className="w-3 h-3" />
                            </div>
                            <p className="text-gray-500 text-xs mt-3">Suportamos apenas arquivos PDF • Análise por IA</p>
                        </label>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {/* Analyzing State */}
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center"
                            >
                                <Loader2 className="w-10 h-10 text-amber-600 mx-auto mb-3 animate-spin" />
                                <h3 className="font-bold text-amber-800 text-lg">🤖 IA Analisando seu Exame...</h3>
                                <p className="text-amber-700 text-sm mt-1">
                                    Extraindo biomarcadores e gerando recomendações ⚡
                                </p>
                                <div className="mt-3 w-full bg-amber-200 rounded-full h-2">
                                    <motion.div
                                        className="bg-amber-500 h-2 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '90%' }}
                                        transition={{ duration: 8, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-red-800 text-sm">Erro na Análise</h3>
                                            <p className="text-red-700 text-xs">{error}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetUpload}
                                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Tentar novamente</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Results */}
                        <AnimatePresence>
                            {analysisResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Success Header */}
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-bold text-green-800 text-sm">Análise Completa! +50 XP</span>
                                        </div>
                                        <button
                                            onClick={resetUpload}
                                            className="text-green-700 text-xs font-medium underline hover:text-green-900"
                                        >
                                            Enviar novo exame
                                        </button>
                                    </div>

                                    {/* Summary */}
                                    {analysisResult.summary && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <h3 className="font-bold text-blue-800 text-sm mb-1">📝 Resumo</h3>
                                            <p className="text-blue-700 text-sm">{analysisResult.summary}</p>
                                        </div>
                                    )}

                                    {/* Biomarkers */}
                                    <h3 className="font-bold text-xl text-cyan-700">📊 Biomarcadores</h3>
                                    {analysisResult.biomarkers?.map((biomarker, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <div>
                                                <h4 className="font-bold text-base text-gray-900">{biomarker.name}</h4>
                                                <p className="text-gray-600 text-sm">
                                                    Valor: {biomarker.value} {biomarker.unit} | Ref: {biomarker.reference}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(biomarker.status)}`}>
                                                {getStatusLabel(biomarker.status)}
                                            </div>
                                        </motion.div>
                                    ))}

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

                                    {/* Alerts */}
                                    {analysisResult.alerts?.length > 0 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <h3 className="font-bold text-orange-800 text-sm mb-2">⚠️ Alertas</h3>
                                            <ul className="space-y-1">
                                                {analysisResult.alerts.map((alert, idx) => (
                                                    <li key={idx} className="text-sm text-orange-700">• {alert}</li>
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                    <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800 flex items-center text-sm">
                                ⚠️ Aviso Importante
                                <Star className="w-3 h-3 ml-1 text-yellow-600" />
                            </h3>
                            <p className="text-red-700 text-xs">
                                A análise da IA é uma ferramenta de apoio educacional e não substitui o aconselhamento
                                de um profissional de saúde qualificado. Consulte sempre seu médico para interpretação
                                clínica dos seus resultados. 🩺
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Labs;
