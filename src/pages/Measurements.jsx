import React, { useState } from 'react';
import { Ruler, Scale, CheckCircle } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeMeasurements } from '../services/aiService';
import AIAnalysisPage from '../components/common/AIAnalysisPage';

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
        <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
            <AIAnalysisPage.Header
                icon={Ruler}
                title="Análise de Medidas Corporais"
                description="Faça upload das suas medidas corporais e receba uma análise personalizada por IA 🧠"
                gradient="from-blue-500 to-cyan-500"
            />

            <AIAnalysisPage.UploadZone
                onUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                accept=".pdf"
            />

            <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message="IA Analisando Medidas..." />
            <AIAnalysisPage.Error error={error} onReset={resetUpload} />

            <AIAnalysisPage.Results show={!!analysisResult}>
                {/* Success */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-bold text-green-800 dark:text-green-400 text-sm">Análise Completa! +30 XP</span>
                    </div>
                    <button onClick={resetUpload} className="text-green-700 dark:text-green-400 text-xs font-medium underline hover:text-green-900 dark:hover:text-green-300">
                        Enviar novas medidas
                    </button>
                </div>

                {/* BMI Card */}
                {analysisResult?.bmi && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-200 dark:border-border-subtle rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-bold text-blue-800 dark:text-blue-400">IMC</h3>
                                </div>
                                <p className={`text-3xl font-bold ${getBMIColor(analysisResult.bmi.value)}`}>
                                    {analysisResult.bmi.value}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700 dark:text-text-primary">{analysisResult.bmi.classification}</p>
                                {analysisResult.waistHipRatio && (
                                    <p className="text-xs text-gray-500 dark:text-text-muted mt-1">
                                        Cintura/Quadril: {analysisResult.waistHipRatio.value} ({analysisResult.waistHipRatio.classification})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Measurements Grid */}
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">📐 Medidas Extraídas</h3>
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
                                className="bg-gray-50 dark:bg-bg-secondary border border-gray-200 dark:border-border-subtle rounded-xl p-3 text-center"
                            >
                                <p className="text-xs text-gray-500 dark:text-text-muted mb-1">{labels[key] || key}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-text-primary">{data.value}</p>
                                <p className="text-xs text-gray-400 dark:text-text-muted">{data.unit}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary */}
                {analysisResult?.summary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-border-subtle rounded-xl p-4">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">📝 Análise</h3>
                        <p className="text-blue-700 dark:text-text-secondary text-sm">{analysisResult.summary}</p>
                    </div>
                )}
            </AIAnalysisPage.Results>

            <AIAnalysisPage.Disclaimer />
        </AIAnalysisPage>
    );
};

export default Measurements;
