import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeExam, getExamHistory } from '../services/aiService';
import AIAnalysisPage, { AIAnalysisResults } from '../components/common/AIAnalysisPage';

const Labs = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [expandedExamId, setExpandedExamId] = useState(null);
    const { addXP } = useGamification();

    useEffect(() => {
        loadHistory();
    }, [analysisResult]); // Reload history when a new analysis completes

    const loadHistory = async () => {
        try {
            const data = await getExamHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

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

    const toggleExamDetails = (id) => {
        setExpandedExamId(expandedExamId === id ? null : id);
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

    // Reusable component to render analysis details
    const AnalysisDetailView = ({ analysis }) => (
        <AIAnalysisResults show={true}>
            {/* Summary */}
            {analysis?.summary && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-1">📝 Resumo</h3>
                    <p className="text-blue-700 dark:text-text-secondary text-sm">{analysis.summary}</p>
                </div>
            )}

            {/* Biomarkers */}
            <h3 className="font-bold text-xl text-cyan-700 dark:text-cyan-400 mt-4">📊 Biomarcadores</h3>
            <div className="space-y-3">
                {analysis?.biomarkers?.map((biomarker, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white dark:bg-bg-secondary rounded-xl border border-gray-200 dark:border-border-subtle hover:shadow-sm transition-shadow"
                    >
                        <div>
                            <h4 className="font-bold text-base text-gray-900 dark:text-text-primary">{biomarker.name}</h4>
                            <p className="text-gray-600 dark:text-text-muted text-sm">
                                <span className="font-medium">Resultado:</span> {biomarker.value} {biomarker.unit}
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-xs">Ref: {biomarker.reference}</span>
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(biomarker.status)}`}>
                            {getStatusLabel(biomarker.status)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recommendations */}
            {analysis?.recommendations?.length > 0 && (
                <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-border-subtle rounded-xl p-4 mt-4">
                    <h3 className="font-bold text-cyan-800 dark:text-cyan-400 text-sm mb-2">💡 Recomendações</h3>
                    <ul className="space-y-1">
                        {analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-cyan-700 dark:text-text-secondary">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </AIAnalysisResults>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Upload Section */}
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

                {/* Current Analysis Result */}
                {analysisResult && (
                    <div className="mt-8">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center justify-between mb-6">
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
                        <AnalysisDetailView analysis={analysisResult} />
                    </div>
                )}

                <AIAnalysisPage.Disclaimer />
            </AIAnalysisPage>

            {/* History Section */}
            <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
                <div className="flex items-center space-x-2 mb-6">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-text-secondary">Histórico de Importações</h3>
                </div>

                {isLoadingHistory ? (
                    <div className="text-center py-8 text-gray-400">Carregando histórico...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-bg-elevated rounded-2xl border border-dashed border-gray-200 dark:border-border-subtle">
                        <p className="text-gray-400 text-sm">Nenhum exame importado ainda.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((exam) => (
                            <motion.div
                                key={exam.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-bg-elevated rounded-2xl border border-gray-200 dark:border-border-subtle overflow-hidden shadow-sm"
                            >
                                <div
                                    onClick={() => toggleExamDetails(exam.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-bg-secondary transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex flex-col items-start gap-1 mb-1">
                                                <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm truncate w-full pr-4" title={exam.file_name}>
                                                    {exam.file_name}
                                                </h4>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase font-bold">
                                                    Analisado
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-text-muted mt-1 space-x-3">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(exam.created_at).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span>{exam.analysis?.biomarkers?.length || 0} biomarcadores</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {expandedExamId === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedExamId === exam.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100 dark:border-border-subtle bg-gray-50/50 dark:bg-bg-secondary/30"
                                        >
                                            <div className="p-4 md:p-6">
                                                <AnalysisDetailView analysis={exam.analysis} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Labs;
