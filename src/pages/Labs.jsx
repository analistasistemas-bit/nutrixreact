import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { analyzeExam } from '../services/aiService';
import AIAnalysisPage from '../components/common/AIAnalysisPage';

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
        <AIAnalysisPage uploadedFile={uploadedFile} isAnalyzing={isAnalyzing} error={error}>
            <AIAnalysisPage.Header
                icon={CheckCircle}
                title="Análise de Exames de Sangue"
                description="Faça upload do seu exame e receba uma análise personalizada por IA 🧠"
                gradient="from-blue-500 to-cyan-500"
            />

            <AIAnalysisPage.UploadZone
                onUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                accept=".pdf"
            />

            <AIAnalysisPage.Loading isAnalyzing={isAnalyzing} message="IA Analisando seu Exame..." />
            <AIAnalysisPage.Error error={error} onReset={resetUpload} />

            <AIAnalysisPage.Results show={!!analysisResult}>
                {/* Success Header */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-bold text-green-800 dark:text-green-400 text-sm">Análise Completa! +50 XP</span>
                    </div>
                    <button
                        onClick={resetUpload}
                        className="text-green-700 dark:text-green-400 text-xs font-medium underline hover:text-green-900 dark:hover:text-green-300"
                    >
                        Enviar novo exame
                    </button>
                </div>

                {/* Summary */}
                {analysisResult?.summary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">📝 Resumo</h3>
                        <p className="text-blue-700 dark:text-text-secondary text-sm">{analysisResult.summary}</p>
                    </div>
                )}

                {/* Biomarkers */}
                <h3 className="font-bold text-xl text-cyan-700 dark:text-cyan-400">📊 Biomarcadores</h3>
                {analysisResult?.biomarkers?.map((biomarker, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-bg-secondary rounded-xl border border-gray-200 dark:border-border-subtle"
                    >
                        <div>
                            <h4 className="font-bold text-base text-gray-900 dark:text-text-primary">{biomarker.name}</h4>
                            <p className="text-gray-600 dark:text-text-muted text-sm">
                                Valor: {biomarker.value} {biomarker.unit} | Ref: {biomarker.reference}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(biomarker.status)}`}>
                            {getStatusLabel(biomarker.status)}
                        </div>
                    </motion.div>
                ))}

                {/* Recommendations */}
                {analysisResult?.recommendations?.length > 0 && (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-border-subtle rounded-xl p-4">
                        <h3 className="font-bold text-cyan-800 dark:text-cyan-400 text-sm mb-2">💡 Recomendações</h3>
                        <ul className="space-y-1">
                            {analysisResult.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-sm text-cyan-700 dark:text-text-secondary">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    <span>{rec}</span>
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

export default Labs;
